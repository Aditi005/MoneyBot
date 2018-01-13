'use strict';

const Restify=require('restify');
const request=require('request');
const server=Restify.createServer({
    name:'MoneyBot'
});

const PORT=process.env.PORT || 3000;

server.use(Restify.plugins.bodyParser());
server.use(Restify.plugins.jsonp());

const currencyConvert=(amount_to_convert,output_currency,cb)=>{
    const{
        amount,
        currency
    }=amount_to_convert;
    return request({
        url:"https://api.fixer.io/latest",
        qs:{
            base:currency,
            symbols:output_currency
        },
        method:'GET',
        json:true
    },(error,response,body)=>{
        console.log(response.statusCode);
        if(!error && response.statusCode===200){
            let computeCurrency=Math.round(body.rates[output_currency]*amount);
            cb(null,amount+" "+currency+" is about "+output_currency+" "+computeCurrency+" as per current rates!!");
        }else{
            cb(error,null);
           
        }
    });
};

//route handler
server.post('/',(req,res,next)=>{
    let{
        status,
        result
    }=req.body;

    if(status.code===200 && result.action==='convert'){
     const{
         output_currency,
         amount_to_convert
     }=result.parameters;
      //input currency code= output currenncy code
    if(amount_to_convert.currency===output_currency){
        const{
            amount,
            currency
        }=amount_to_convert;

        let responseText="Well, "+amount+" "+output_currency +" is obviously equal to "+amount+" "+output_currency+" !";
        console.log(responseText);
        res.json({
            speech:responseText,
            displayText:responseText,
            source:"new_agent-webhook"
        });
    }else{
       currencyConvert(amount_to_convert,output_currency,(error,result)=>{
           if(!error && result){
               res.json({
                   speech:result,
                   displayText:result,
                   source:"new_agent-webhook"
               });
           }
       });
    }
   
    }
    console.log(result);
    return next();
});
server.listen(PORT,()=>console.log('Money Bot running on port '+ PORT));