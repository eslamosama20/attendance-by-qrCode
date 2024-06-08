const mongoose =require('mongoose')
const dotenv =require('dotenv')
dotenv.config({path :'config.env'});

// connection with db
const dbConnection=()=>{
mongoose.connect(process.env.DB_URL)
.then((conn)=>{
    console.log(`DATABASE CONNECTED :${conn.connection.host}`)
}).catch(err=>{
    console.log(`Database Error : ${err}`)
    process.exit(1)
})
}
module.exports=dbConnection