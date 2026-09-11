import { useForgotPassword } from "../hooks/loginHook"
import { Link } from "react-router"
import "../styles/loginPage.css"
import z from "zod"
import {useForm} from "@tanstack/react-form"
import { useEffect } from "react"
import Loader from "../components/loader"
import toast from "react-hot-toast"

const ForgotPasswordPage = () => {

    const forgotPasswordSchema = z.object({
        email: z.email(),
    })

    const form = useForm({
        defaultValues:{
            email:"",
        },
        validators: {
            onSubmit: forgotPasswordSchema,
        },
        onSubmit:({value}) => handleSubmit(value.email)
    })

    const forgotPassword = useForgotPassword();

    const handleSubmit = (email: string) => {
        forgotPassword.mutateAsync(email);
    }

    useEffect(() => {
        if (forgotPassword.isSuccess) {
            toast.success(`${forgotPassword.data}`);
        }
    }, [forgotPassword.isSuccess]);

    if(forgotPassword.isError){
        console.error(forgotPassword.error);
    }

    return(
    <>
        <main className="login-page">
            <section className="login-card">
                <header className="login-header">
                   {/* <img src="logo.svg" alt="Company Logo" /> */} 
                    <p>Enter your email</p>
                </header>

                {forgotPassword.isError && (
                    <div className="login-error">{`${forgotPassword.error}`}.</div>
                )}
                <form onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}>
                    <div className="form-group">
                        <label>Email</label>
                        <form.Field name="email">
                            {(field) => 
                            <input value={field.state.value} onChange={(e)=>field.handleChange(e.target.value)}
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                            />}
                        </form.Field>
                    </div>

                    <div className="forgot-password-container">
                        <Link className="forgot-password" to={`/login`}>Back to login</Link>
                    </div>

                    <button className="login-btn" type="submit">
                        {forgotPassword.isPending ? <div><Loader size="sm" fullHeight={false}/></div> : "Verify"}
                    </button>
                </form>
            </section>
        </main>
    </>
    )
}

export default ForgotPasswordPage