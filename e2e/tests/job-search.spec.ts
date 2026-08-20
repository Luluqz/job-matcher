import { test, expect } from '@playwright/test';

test.describe('Recherche et matching IA', () => {
  test('recherche des offres et les score via l\'IA', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/');

    await page.fill('#what', 'développeur angular');
    await page.fill('#where', 'Paris');
    await page.click('button[type="submit"]');

    await expect(page.locator('.job-card').first()).toBeVisible({ timeout: 20_000 });
    const jobCount = await page.locator('.job-card').count();
    expect(jobCount).toBeGreaterThan(0);

    await page.fill(
      '#profile',
      "Développeur Angular avec 5 ans d'expérience, je cherche un poste orienté frontend, idéalement en télétravail.",
    );
    await page.click('button:has-text("Analyser avec l\'IA")');

    await expect(page.locator('.score').first()).toBeVisible({ timeout: 30_000 });
    const scoreCount = await page.locator('.score').count();
    expect(scoreCount).toBe(jobCount);

    // Le tri par score décroissant est fait en code, jamais par le prompt — on le vérifie ici.
    const scores = (await page.locator('.score').allTextContents()).map((s) => parseFloat(s));
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeLessThanOrEqual(scores[i - 1]);
    }

    expect(consoleErrors).toEqual([]);
  });

  test('le bouton Rechercher est désactivé sans mot-clé', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });

  test('un mot-clé sans résultat affiche le message "aucune offre"', async ({ page }) => {
    await page.goto('/');

    await page.fill('#what', 'zzzzzzzzzzintitulezzzzzzzzzzimpossible');
    await page.click('button[type="submit"]');

    await expect(page.locator('.empty')).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('.job-card')).toHaveCount(0);
  });
});
