import { After, Before } from '@cucumber/cucumber';
import AllureReporter from '@wdio/allure-reporter';

Before(async function () {
    const tagValueToUse = process.env.ALLURE_REPORT_TAG_NAME;
    if (tagValueToUse) {
        AllureReporter.addTag(tagValueToUse);
    }
});

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