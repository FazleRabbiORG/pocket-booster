import { NativeModules } from 'react-native';
const { AppChecker, OpenChrome, UsageStatsModule, AppLauncherModule } =
    NativeModules;

const isAppInstalled = async (packageName: string) => {
    try {
        const result = await AppChecker.isAppInstalled(packageName);
        return result;
    } catch (error) {
        console.error(error);
        return false;
    }
};

const openChrome = async (url: string) => {
    try {
        const result = await OpenChrome.openChrome(url);
        return result;
    } catch (error) {
        console.error(error);
        return error;
    }
};

const todayAppUsage = async (packageName: string, date: String) => {
    try {
        const result =
            await UsageStatsModule.getAppUsageForUpcoming15DaysAndToday(
                packageName,
                date,
            );
        return result;
    } catch (error) {
        console.error(error);
        return error;
    }
};

const appOpen = async (packageName: string) => {
    AppLauncherModule.openApp(packageName)
        .then((message: any) => {
            console.log(message); // "App launched successfully"
        })
        .catch((error: any) => {
            console.error('Error:', error); // Handle errors like app not found or any other issue
        });
};

export { isAppInstalled, openChrome, todayAppUsage, appOpen, UsageStatsModule };
