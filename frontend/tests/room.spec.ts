import { test, expect } from '@playwright/test'

test.describe('ระบบจัดการห้อง (Room Management)', () => {
  test('ควรจะสร้างห้องและเปลี่ยนหน้าไปยัง Room Detail ได้สำเร็จ', async ({
    page,
  }) => {
    await page.goto('http://localhost:5173/room')
    const apiCallPromise = page.waitForResponse(
      (response) =>
        response.url().includes('http://localhost:8080/rooms') &&
        response.request().method() === 'POST',
      //   { timeout: 10000 },
    )

    await page.getByTestId('room-list-button').click()
    await page.getByTestId('create-types-button').click()
    await page.getByTestId('create-room-button').click()
    await page.getByTestId('btn-create-room').click()
    const response = await apiCallPromise
    console.log('API Status:', response)
    expect(response.status())
    // await responsePromise
  })

  test('ควรจะสลับไปดูรายการห้องได้', async ({ page }) => {
    await page.goto('http://localhost:5173/room')
    await page.getByTestId('room-list-button').click()
    const table = page.locator('table')
    await expect(table).toBeVisible()
  })

  test('เข้าห้องที่สร้างไว้ได้', async ({ page }) => {
    await page.goto('http://localhost:5173/room')
    await page.getByTestId('room-list-button').click()

    const table = page.locator('table')
    await expect(table).toBeVisible()
    const firstRowCell = table.locator('tbody tr').first().locator('td').first()
    await firstRowCell.click()
  })
})
