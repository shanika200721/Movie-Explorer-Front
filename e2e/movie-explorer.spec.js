const { test, expect } = require('@playwright/test');

function movie(id, title, overrides = {}) {
  return {
    id, title, overview: `${title} overview`, posterPath: null, backdropPath: null,
    releaseDate: '2024-01-02', genreIds: [28], voteAverage: 7.5, voteCount: 10,
    ...overrides,
  };
}

async function mockApi(page, options = {}) {
  let trendingCalls = 0;
  await page.route('**/auth/register', async (route) => {
    const body = route.request().postDataJSON();
    if (body.username === 'taken') return route.fulfill({ status: 409, json: { message: 'Username is already in use' } });
    return route.fulfill({ json: { accessToken: `token-${body.username}`, user: { id: body.username === 'alice' ? 1 : 2, username: body.username } } });
  });
  await page.route('**/auth/login', async (route) => {
    const body = route.request().postDataJSON();
    if (body.password === 'wrongpass') return route.fulfill({ status: 401, json: { message: 'Invalid username or password' } });
    return route.fulfill({ json: { accessToken: `token-${body.username}`, user: { id: body.username === 'alice' ? 1 : 2, username: body.username } } });
  });
  await page.route('**/movies/genres', (route) => route.fulfill({ json: { genres: [{ id: 28, name: 'Action' }] } }));
  await page.route('**/movies/trending**', async (route) => {
    trendingCalls += 1;
    if (options.expireAuth) return route.fulfill({ status: 401, json: { message: 'Unauthorized' } });
    if (options.failTrendingOnce && trendingCalls === 1) return route.fulfill({ status: 503, json: { message: 'Movie data is temporarily unavailable' } });
    return route.fulfill({ json: { page: 1, totalPages: 1, totalResults: 1, results: [movie(1, 'Trending Film')] } });
  });
  await page.route('**/movies/search**', async (route) => {
    const url = new URL(route.request().url());
    const query = url.searchParams.get('query');
    const requestedPage = Number(url.searchParams.get('page'));
    if (query === 'alpha') await new Promise((resolve) => setTimeout(resolve, 900));
    const result = query === 'paged'
      ? movie(requestedPage, requestedPage === 1 ? 'First Page' : 'Second Page')
      : movie(query === 'alpha' ? 20 : 21, `${query} result`);
    return route.fulfill({ json: { page: requestedPage, totalPages: query === 'paged' ? 2 : 1, totalResults: query === 'paged' ? 2 : 1, results: [result, ...(requestedPage === 2 ? [result] : [])] } });
  });
  await page.route('**/movies/discover**', async (route) => {
    const url = new URL(route.request().url());
    return route.fulfill({ json: { page: 1, totalPages: 1, totalResults: 1, results: [movie(30, `Genre ${url.searchParams.get('genre') || 'all'}`)] } });
  });
  await page.route(/\/movies\/\d+$/, (route) => route.fulfill({ json: {
    ...movie(1, 'Sparse Film', { releaseDate: null, voteAverage: 0 }), genres: [], cast: [], trailer: null,
  } }));
}

async function register(page, username = 'alice') {
  await page.goto('/register');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill('strongpass');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/$/);
}

test('registration, protected routes, invalid login, duplicate username, and invalid input', async ({ page }) => {
  await mockApi(page);
  await page.goto('/favorites');
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('Username').fill('alice');
  await page.getByLabel('Password').fill('wrongpass');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('Invalid username or password')).toBeVisible();
  await page.goto('/register');
  await page.getByLabel('Username').fill('taken');
  await page.getByLabel('Password').fill('strongpass');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByText('Username is already in use')).toBeVisible();
  await page.getByLabel('Username').fill('bad name');
  await expect(page.getByLabel('Username').evaluate((input) => input.checkValidity())).resolves.toBe(false);
});

test('trending retry, sparse details, and keyboard navigation', async ({ page }) => {
  await mockApi(page, { failTrendingOnce: true });
  await register(page);
  await expect(page.getByText('Movie data is temporarily unavailable')).toBeVisible();
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(page.getByText('Trending Film')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus-visible')).toBeVisible();
  await page.getByText('Trending Film').click();
  await expect(page.getByText('Release date unavailable')).toBeVisible();
  await expect(page.getByText('Cast information is unavailable.')).toBeVisible();
  await expect(page.getByText('Trailer unavailable.')).toBeVisible();
  await expect(page.getByAltText('Poster unavailable for Sparse Film')).toBeVisible();
});

test('rapid search changes keep the newest response and pagination stops at the end', async ({ page }) => {
  await mockApi(page);
  await register(page);
  await page.getByRole('link', { name: 'Search' }).click();
  const search = page.getByLabel('Search movies');
  await search.fill('alpha');
  await page.waitForTimeout(500);
  await search.fill('beta');
  await expect(page.getByText('beta result')).toBeVisible();
  await page.waitForTimeout(1000);
  await expect(page.getByText('alpha result')).toHaveCount(0);
  await search.fill('paged');
  await expect(page.getByText('First Page')).toBeVisible();
  const loadMore = page.getByRole('button', { name: 'Load more' });
  if (await loadMore.isVisible().catch(() => false)) await loadMore.click();
  await expect(page.getByText('Second Page')).toBeVisible();
  await expect(page.getByText('Second Page')).toHaveCount(1);
  await expect(loadMore).toHaveCount(0);
});

test('favorites and last search persist separately by authenticated user', async ({ page }) => {
  await mockApi(page);
  await register(page, 'alice');
  await page.getByLabel('Add Trending Film to favorites').click();
  await page.getByRole('link', { name: 'Search' }).click();
  await page.getByLabel('Search movies').fill('remember me');
  await page.waitForTimeout(500);
  await page.getByLabel('log out').click();
  await register(page, 'bob');
  await page.getByRole('link', { name: 'Favorites' }).click();
  await expect(page.getByText('You have not saved any favorites yet.')).toBeVisible();
  await page.getByLabel('log out').click();
  await page.goto('/login');
  await page.getByLabel('Username').fill('alice');
  await page.getByLabel('Password').fill('strongpass');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: 'Favorites' }).click();
  await expect(page.getByText('Trending Film')).toBeVisible();
  await page.getByRole('link', { name: 'Search' }).click();
  await expect(page.getByLabel('Search movies')).toHaveValue('remember me');
});

test('theme persists, discover sends filters, and expiry returns to login', async ({ page }) => {
  await mockApi(page);
  await register(page);
  await page.getByLabel('use dark mode').click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('movieExplorerTheme'))).toBe('dark');
  await page.reload();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(18, 22, 21)');
  await page.getByLabel('Username').fill('alice');
  await page.getByLabel('Password').fill('strongpass');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: 'Browse' }).click();
  await page.getByLabel('Genre').click();
  await page.getByRole('option', { name: 'Action' }).click();
  await expect(page.getByText('Genre 28')).toBeVisible();
});

test('authentication expiry shows a clear login message', async ({ page }) => {
  await mockApi(page, { expireAuth: true });
  await register(page);
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText('Your session expired. Please sign in again.')).toBeVisible();
});

test('layout has no horizontal overflow', async ({ page }) => {
  await mockApi(page);
  await register(page);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
