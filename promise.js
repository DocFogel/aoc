var mypromise = new Promise((resolve, reject) => {
    setTimeout(() => resolve("Jonas"), 1000);
})

mypromise
    .then(value => `${value} Fogelberg`)
    .then(value => { 
        console.info(value);
        return new Error(value);
    })
    .then(value => { 
        console.error("Oops!"); 
        return Promise.reject(value.message); 
    })
    .catch(reason => console.info(reason, "det sket sig..."));

console.log("Let's go...");