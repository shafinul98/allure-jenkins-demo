import { After } from '@cucumber/cucumber';

After(async function (scenario) {

    if (scenario.result.status === 'FAILED') {

        const screenshot = await browser.takeScreenshot();

        await this.attach(
            Buffer.from(screenshot, 'base64'),
            'image/png'
        );

        await browser.saveScreenshot(
            `./screenshots/${scenario.pickle.name}.png`
        );
    }
});