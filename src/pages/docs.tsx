const DocsPage = () => {
  const changeFile = (e: any) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(e.target.files[0]);
    const blob = new Blob([e.target.result]);
    const a = document.createElement('a');
    a.style.display = 'none';
    // a.download = fileName;
    // 生成一个临时的URL（现在下载不了，因为生产的url不是真实的下载地址）
    a.href = window.URL.createObjectURL(blob);
    document.body.appendChild(a);
  }

  return (
    <div>
      <input type="file" multiple={true} onChange={changeFile} />
    </div>
  );
};

export default DocsPage;
