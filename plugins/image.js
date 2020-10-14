const btoa = require("btoa");

export default ({ app, store }, inject) => {
  inject("image", {
    decode(res) {
      // return ''
      if (!res?.data) return "";
      let image = btoa(
        new Uint8Array(res.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );
      return `data:${res.headers[
        "content-type"
      ].toLowerCase()};base64,${image}`;
    },
    createBase64Image(fileObject) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
          resolve(e.target.result);
        };

        reader.readAsDataURL(fileObject);
      });
    }
  });
};
