import { useTranslation } from "react-i18next";
import VideoCaptureUploader from "../components/VideoStream";
import { useSearchParams } from 'react-router-dom';

const AiMobileWebview = () => {
  const [searchParams] = useSearchParams();
  const model: string | null = searchParams.get("model");
  const label: string | null = searchParams.get("label");
  const debug: boolean = searchParams.get("debug") === "true";

  const { t } = useTranslation();

  const sendValidation = () => {
    try {
      // @ts-ignore
      window.ReactNativeWebView.postMessage('Pass!');
    } catch {
      console.error("Error sending message to React Native WebView");
    }
  }

  // console.log(model, typeof model);
  // console.log(label, typeof label);
  // console.log(debug, typeof debug);

  if (model === null) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg shadow-md">
          {t("No model provided")}
        </div>
      </div>
    );
  }

  if (label === null) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg shadow-md">
          {t("No success label")}
        </div>
      </div>
    );
  }



  return (
    <div className="container mx-auto px-4 py-8">

      {/* Video capture component */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow-md mx-auto">
        <VideoCaptureUploader
          goodAnswer={sendValidation}
          badAnswer={() => {}}
          response={label}
          model={model}
        />
      </div>


      {debug &&
        <button
          onClick={sendValidation}
        > Pass </button>
      }

    </div>
  );
};

export default AiMobileWebview;
