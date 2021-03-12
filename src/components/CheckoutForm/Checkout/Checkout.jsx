import React, { useState, useEffect } from 'react';
import { Paper, Stepper, Step, StepLabel, Typography, CircularProgress, Divider, Button, CssBaseline } from '@material-ui/core';
import AddressForm from '../AddressForm';
import PaymentForm from '../PaymentForm';
import { Link, useHistory } from 'react-router-dom'
import { commerce } from '../../../lib/commerce'
import useStyles from './styles';

const steps = ['Shipping Address', 'Payment Details'];

const Checkout = ({ cart, order, onCaptureCheckout, error }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [checkoutToken, setCheckoutToken] = useState(null);
    const [shippingData, setShippingData] = useState({});
    const [isFinished, setIsFinished] = useState(false);
    const classes = useStyles();
    const history = useHistory();

    const timeout = () => {
        setTimeout(() => {
            setIsFinished(true)
        }, 3000)
    }

    useEffect(() => {
        if (cart.id) {
            const generateToken = async () => {
                try {
                    const token = await commerce.checkout.generateToken(cart.id, { type: 'cart' });
                    setCheckoutToken(token)
                } catch (error) {
                    history.push('/');
                }
            }
            generateToken();
        }
    }, [cart])

    const nextData = () => setActiveStep((prevActionStep) => prevActionStep + 1);
    const backData = () => setActiveStep((prevActionStep) => prevActionStep - 1);

    const next = data => {
        setShippingData(data);
        nextData();
    }


    let Confirmation = () => (order.customer ? (
        <>
            <div>
                <Typography variant="h5">Thank you for your purchase, {order.customer.firstname} {order.customer.lastname}!</Typography>
                <Divider className={classes.divider} />
                <Typography variant="subtitle2">Order ref: {order.customer_reference}</Typography>
            </div>
            <br />
            <Button component={Link} variant="outlined" type="button" to="/">Back to home</Button>
        </>
    ) : isFinished ? (
        <>
            <div>
                <Typography variant="h5">Thank you for your purchase!</Typography>
                <Divider className={classes.divider} />
            </div>
            <br />
            <Button component={Link} variant="outlined" type="button" to="/">Back to home</Button>
        </>
    ) : (
                <div className={classes.spinner}>
                    <CircularProgress />
                </div>
            ));
    // if (error) {
    //     Confirmation = () => (
    //         <>
    //             <Typography variant="h5">Error: {error}</Typography>
    //             <br />
    //             <Button component={Link} variant="outlined" type="button" to="/">Back to home</Button>
    //         </>
    //     );
    // }


    const Form = () => activeStep === 0
        ? <AddressForm checkoutToken={checkoutToken} nextStep={nextData} setShippingData={setShippingData} next={next} />
        : <PaymentForm shippingData={shippingData} checkoutToken={checkoutToken} backStep={backData} onCaptureCheckout={onCaptureCheckout} timeout={timeout} nextStep={nextData} />;

    return (
        <>
            <CssBaseline />
            <div className={classes.toolbar} />
            <main className={classes.layout}>
                <Paper className={classes.paper}>
                    <Typography variant="h4" align="center">Checkout</Typography>
                    <Stepper activeStep={activeStep} className={classes.stepper}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                    {activeStep === steps.length ? <Confirmation /> : checkoutToken && <Form />}
                </Paper>
            </main>
        </>
    )
}

export default Checkout
