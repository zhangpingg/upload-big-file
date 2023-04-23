const request = (params: any) => {
  const { url, data, method = "post", headers = {}, onProgress } = params;
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    Object.keys(headers).forEach((key) => {
      xhr.setRequestHeader(key, headers[key]);
    });
    xhr.send(data);

    xhr.onload = (e: any) => {
      return resolve({
        data: e.target.response,
      });
    };
  });
};

export { request };
