import { StyleSheet, View, Image, Alert } from 'react-native'
import React from 'react'
import Container from '../components/Container'
import { theme } from '../core/theme'
import { Title, Text, TextInput, Button } from 'react-native-paper'
import { Formik } from 'formik';
import * as Yup from 'yup';
import { cortexSurveyApi } from '../api/cortexSurveyApi'

const initialValues = {
    password: "",
    confimPassword: "",
}

const changePasswordSchema = Yup.object().shape({
    password: Yup.string().min(6, 'Too Short!').max(50, 'Too Long!').required('Password is Required'),
    confimPassword: Yup.string().required('Confirm Password is Required')
        .oneOf([Yup.ref('password'), null], 'Passwords must match'),
});

const ChangeNewPasswordScreen = ({ route, navigation }) => {

    const { otp, email } = route.params;
    const [submitLoader, setSubmitLoader] = React.useState(false);
    const [isDisabled, setIsDisabled] = React.useState(false);
    const [showHidePassword, setShowHidePassword] = React.useState({
        icon: 'eye',
        password: true
    });

    const showPassword = () => {
        setShowHidePassword(prevState => ({
            icon: prevState.icon === 'eye' ? 'eye-off' : 'eye',
            password: !prevState.password
        }))
        console.log("show password");
    }

    const saveAndContinue = async (values) => {

        setSubmitLoader(true);
        setIsDisabled(true);

        if (otp !== '' && email !== '') {
            const data = {
                email: email,
                code: otp,
                password: values.confimPassword
            }
            console.log('data: ', data)
            try {
                const result = await cortexSurveyApi.post('reset-password', data);
                if (result.data.success) {
                    Alert.alert(
                        "Succesfull!",
                        "Password Reset Succesfully",
                        [
                            { text: "OK", onPress: () => navigation.navigate('Login') }
                        ]
                    );
                }
            } catch (e) {
                if (e.response && e.response.status === 422) {
                    Alert.alert("Error", Object.values(e.response.data.errors)[0]);
                }
                console.log('error: ', Object.values(e.response.data.errors)[0]);
            }
        }

        setSubmitLoader(false);
        setIsDisabled(false);

    }

    return (
        <Container style={styles.container}>
            <Image
                source={require('../assets/reset_password.gif')}
                style={styles.imgIcon}
            />
            <Title style={{ textAlign: 'center', fontSize: 22 }}>Change New Password</Title>

            <View>
                <Formik
                    initialValues={initialValues}
                    validationSchema={changePasswordSchema}
                    onSubmit={saveAndContinue}
                >
                    {({ handleChange, handleSubmit, values, errors, touched }) => (
                        <View style={styles.formGroup}>
                            <TextInput
                                label="New Password"
                                secureTextEntry={true}
                                left={<TextInput.Icon name="lock-outline" />}
                                onChangeText={handleChange('password')}
                                value={values.password}
                                error={errors.password ? true : false}
                            />
                            {errors.password && touched.password ? (
                                <Text>{errors.password}</Text>
                            ) : null}
                            <TextInput
                                label="Confirm New Password"
                                secureTextEntry={showHidePassword.password}
                                left={<TextInput.Icon name="lock-outline" />}
                                right={<TextInput.Icon name={showHidePassword.icon} onPress={() => showPassword()} />}
                                onChangeText={handleChange('confimPassword')}
                                value={values.confimPassword}
                                error={errors.confimPassword ? true : false}
                            />
                            {errors.confimPassword && touched.confimPassword ? (
                                <Text>{errors.confimPassword}</Text>
                            ) : null}
                            <Button
                                style={styles.btn_large}
                                mode="contained"
                                contentStyle={{ height: 45 }}
                                labelStyle={{ fontSize: 15 }}
                                onPress={handleSubmit}
                                disabled={isDisabled}
                                loading={submitLoader}
                                uppercase={false}
                            >
                                Submit
                            </Button>
                        </View>
                    )}
                </Formik>
            </View>
        </Container>
    )
}

export default ChangeNewPasswordScreen

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.background,
        justifyContent: 'flex-start',
        paddingTop: 10,
        paddingHorizontal: 10
    },
    imgIcon: {
        width: '70%',
        height: '40%',
        alignSelf: 'center'
    },
    formGroup: {
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingTop: 20,
    },
    btn_large: {
        marginTop: 20,
        marginBottom: 10,
        justifyContent: 'center'
    },
})