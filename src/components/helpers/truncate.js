import Axios from "axios";
import { WEBSITE_URL } from "../../configs/website";

export const textTruncate = (str, length, ending) => {
    if (length == null) {
        length = 100;
    }
    if (ending == null) {
        ending = "...";
    }
    if (str.length > length) {
        return str.substring(0, length - ending.length) + ending;
    } else {
        return str;
    }
};
export const getFoodTimes = () => {
  return "You are ";
  var data = [
      [0, 4, "It's supper time"],
      [5, 11, "It's break-fast time"],
      [12, 17, "It's Lunch time"],
      [18, 24, "It's Dinner time"],
    ],
    hr = new Date().getHours();
  for (var i = 0; i < data.length; i++) {
    if (hr >= data[i][0] && hr <= data[i][1]) {
      return data[i][2];
    }
  }
};

export const placeholderImage = "https://i.imgur.com/cLiGwTG.png";
export const placeholderImageLarge = "https://i.imgur.com/yF2NmbD.png";

export const dataURLtoBlob = async (dataUrl) => {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/data:(.*);base64/)[1];
  const binary = atob(base64);
  const len = binary.length;
  const buffer = new Uint8Array(len);
  for (let i = 0; i < len; i++) buffer[i] = binary.charCodeAt(i);
  return new Blob([buffer], { type: mime });
};

export const handleDecodeSafeUpiQr = async (dataUrl) => {
  console.log(dataUrl)
  if (!dataUrl) return null;

  // 1. convert data‑URL → Blob → File
  const blob = await dataURLtoBlob(dataUrl);
  console.log(blob)
  const file = new File([blob], "qrcode.png", { type: blob.type });

  // 2. build multipart body
  const formData = new FormData();
  formData.append("file", file);

  try {
    // 3. send POST request
    const { data } = await Axios.post(
      "https://api.qrserver.com/v1/read-qr-code/",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    // 4. parse response
const result =data &&data[0] &&data[0].symbol &&
  data[0].symbol[0] &&
  data[0].symbol[0].data !== undefined &&
  data[0].symbol[0].data !== null
    ? data[0].symbol[0].data
    : null;

    console.log("Decoded:", result);
    return result;
    // setDecodedData(result || 'Unable to decode QR code');
  } catch (err) {
    console.error("Decoding failed:", err);
    return null;
    // setDecodedData('Error decoding QR code');
  }
};

export const   parseUpiUri=async(upiString)=> {
  const params = {};
  const queryString = upiString.split("?")[1];
  const pairs = queryString.split("&");

  pairs.forEach((pair) => {
    const [key, value] = pair.split("=");
    params[key] = decodeURIComponent(value || "");
  });

  return params;
}

export const FoodomaaAndroidWebViewUA = "FoodomaaAndroidWebViewUA";
export const FoodomaaAndroidWebViewUA2 =
  "FoodomaaAndroidWebViewUA Mozilla/5.0 (iPhone; CPU iPhone OS 18_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.103 Mobile/15E148 Safari/604.1";



// helper: convert URL image → base64
export const urlToBase64 = async (url) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result); // data:image/...;base64,...
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// usage
export const saveQrCodeImage = async (qrImage) => {
  let base64Image = qrImage;

  if (qrImage && qrImage.startsWith("http")) {
    // convert url → base64
    base64Image = await urlToBase64(qrImage);
  }

  sessionStorage.setItem("qrCodeImage", base64Image);
};

export const checkAssetURL = (url) => {

  if(!url){
    return "";
  }

  if(url.startsWith("https://") || url.startsWith("http://")){
   return url;

  }
  return WEBSITE_URL + url;

};