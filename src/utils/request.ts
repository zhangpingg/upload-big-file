const request = (params: any) => {
  const { url, data, method = "post", headers = {}, requestList } = params;
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    Object.keys(headers).forEach((key) => {
      xhr.setRequestHeader(key, headers[key]);
    });
    xhr.send(data);
    xhr.onload = (e: any) => {
      // 将请求成功的 xhr 从列表中删除
      if (requestList) {
        const xhrIndex = requestList.findIndex((item: any) => item === xhr)
        requestList.splice(xhrIndex, 1);
      }
      return resolve({
        data: e.target.response,
      });
    };
    requestList?.push(xhr);
  });
};

export { request };
