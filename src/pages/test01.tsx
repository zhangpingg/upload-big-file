import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    const formData = new FormData();
    formData.append('a', '1')
    formData.append('a', '2');
    formData.append('b', '3')
    formData.set('b', '4');
    const valA = formData.getAll('a');
    const valC = formData.getAll('b');
    console.log(valA);  // ['1', '2']
    console.log(valC);  // ['4']
  }, [])

  return (<div>11</div>)
}

export default Index;
