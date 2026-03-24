import fishVideo from "../assets/vid/animacion_mojarra.webm";
import "../style/global.css";

function Loader({ loading, progress }) {
    return (
        <div className={`loader-screen ${!loading ? "fade-out" : ""}`}>
            <video
                src={fishVideo}
                autoPlay
                loop
                muted
                playsInline
                className="loader-video"
            />

            <p className="loader-text">Bienvenido...</p>

            <div className="loader-bar">
                <div
                    className="loader-progress"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <span className="loader-percent">{progress}%</span>
        </div>
    );
}

export default Loader;