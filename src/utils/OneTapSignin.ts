import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

async function onGoogleButtonPress() {
    console.log('check google play support');
    // Check if your device supports Google Play
    try {
        await GoogleSignin.hasPlayServices({
            showPlayServicesUpdateDialog: true,
        });
        // Get the users ID token
        console.log('get id token');
        const { idToken } = await GoogleSignin.signIn();
        // Create a Google credential with the token
        const googleCredential = auth.GoogleAuthProvider.credential(idToken);
        // Sign-in the user with the credential
        const user = auth().signInWithCredential(googleCredential);
    } catch (error) {
        console.log('error onTap page', error);
    }
}

export default onGoogleButtonPress;
