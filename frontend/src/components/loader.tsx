import "../styles/loader.css";

type LoaderProps = {
    size?: "sm" | "md" | "lg";
    fullHeight?: boolean;
};

const Loader = ({ size = "md", fullHeight = true }: LoaderProps) => {
    return (
        <div className={`loader-wrap ${fullHeight ? "loader-wrap-full" : ""}`}>
            <span className={`loader loader-${size}`} />
        </div>
    );
};

export default Loader;