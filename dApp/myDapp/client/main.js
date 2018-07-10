import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import './main.html';

//asignación del proveedor
if(typeof web3 !== 'undefined'){//MetaMask inyecta el proveedor directamente
  web3 = new Web3(web3.currentProvider);
}else{
	web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));//en el caso de no utilizar MetaMask, poner url del noto Ethereum a utilizar
};

Template.Smsg.onCreated(function () {

  this.signedmsg = new ReactiveVar();
  this.address = new ReactiveVar();
});

Template.Smsg.helpers({
  signedmsg() {
    return Template.instance().signedmsg.get();
    },
  address(){
    return Template.instance().address.get();
    }
});
//variables
var abi=[
	{
		"constant": false,
		"inputs": [],
		"name": "cancel",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_precioVendedor",
				"type": "uint256"
			},
			{
				"name": "hash",
				"type": "bytes32"
			},
			{
				"name": "v",
				"type": "uint8"
			},
			{
				"name": "r",
				"type": "bytes32"
			},
			{
				"name": "s",
				"type": "bytes32"
			}
		],
		"name": "finished",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"name": "_vendedor",
				"type": "address"
			}
		],
		"payable": true,
		"stateMutability": "payable",
		"type": "constructor"
	}
];
var address;
var date;
var signature;
var hash;
var _sellerPrice;
var _buyerPrice;
var fixed_msg_sha;
var r;
var s;
var v;
var finish='false';
var receipt;
var trHash;
var trHash1;
var mined='false';
var _vendedor;
var _comprador;
var recibo;

//events al clicar sobre los botones de la web
Template.Smsg.events({
  //clic para crear contrato
    "click #createContract"(event, Template){
      finish='false';
      document.getElementById("recibo").innerHTML = "";
      document.getElementById("container").style.display = "none";
      document.getElementById("loader").style.display = "block";
      document.getElementById("cancel").disabled = false;
      document.getElementById("cancel").innerHTML = "Cancel";
      document.getElementById("finished").disabled = false;
      document.getElementById("finished").innerHTML = "Finished";
      alert('Creating a contract. This process can take a few minutes.')
      _vendedor = $("input[id=sellerAddress").val();
      date = $("input[id=date").val();
      _buyerPrice = $("input[id=payableCost").val()*1000000000000000000;
      var MyContract = web3.eth.contract(abi);
      var payfairfixedtimeout = MyContract.new(
      _vendedor,
      {
        from: web3.eth.accounts[0],
        data: '0x60806040526040516020806104c383398101806040528101908080519060200190929190505050336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506000600260146101000a81548160ff02191690831515021790555034600381905550506103ea806100d96000396000f30060806040526004361061004c576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063ea8a1af014610051578063f362bcec14610068575b600080fd5b34801561005d57600080fd5b506100666100cc565b005b34801561007457600080fd5b506100ca600480360381019080803590602001909291908035600019169060200190929190803560ff1690602001909291908035600019169060200190929190803560001916906020019092919050505061019b565b005b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614801561013b575060001515600260149054906101000a900460ff161515145b151561014657600080fd5b6001600260146101000a81548160ff0219169083151502179055506000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16ff5b84600481905550600184848484604051600081526020016040526040518085600019166000191681526020018460ff1660ff1681526020018360001916600019168152602001826000191660001916815260200194505050505060206040516020810390808403906000865af1158015610219573d6000803e3d6000fd5b50505060206040510351600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161480156102c35750600354600454145b801561033e5750600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16145b801561035d575060001515600260149054906101000a900460ff161515145b151561036857600080fd5b6001600260146101000a81548160ff021916908315150217905550600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16ff00a165627a7a72305820ffb0a4c3067e79ba8cae23731b8107a0af20bbd2069fa12a0bf96d3bb540f8ea0029',
        gas: '4700000',
        value: _buyerPrice
      }, function (e, contract){
          console.log(e, contract);
          try{
            if (typeof contract.address !== 'undefined') {//el contrato se ha creado
              address=contract.address;
              _comprador=web3.eth.accounts[0];
              console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
              alert('The contract with address: '+address+' has been created. ')
              document.getElementById("loader").style.display = "none";
              document.getElementById("container").style.display = "block";
              document.getElementById("buyer").style.display = "block";
              document.getElementById("seller").style.display = "block";
            }
          }catch{
            alert("The contract hasn't been created "+e);
            document.getElementById("loader").style.display = "none";
            document.getElementById("container").style.display = "block";
          }
          })
        },

//clic para cancelar
    "click #cancel"(event, Template){
        web3.eth.contract(abi).at(address).cancel(function(err, result){//se ejecuta la función de cancelación del contrato
          console.log('error cancel'+err);
          console.log(result);
          trHash1=result;
          if(typeof result!=='undefined'){//la transacción se ha ejecutado
            document.getElementById("cancel").disabled = true;
            document.getElementById("cancel").innerHTML = "You can't cancel again.";
            alert('Operation cancelled. '+result);
          }else{
            alert('Error cancelling the purchase. '+err);
          }
          waitForCancelReceipt(trHash1, function () {
            console.log("Transaction succeeded.");
          });
        });
      },

//clic para finalizar
        "click #finished"(event, Template){
            _sellerPrice = $("input[id=sellerPrice").val()*1000000000000000000;
            if(_sellerPrice==_buyerPrice){//los ethers del comprador y vendedor coinciden
              sign(function () {//se realiza la función sign y se ejecutará el código siguiente
                if(typeof signature!=='undefined'){//en este momento se ha obtenido la firma
                  console.log("Signed.");
                  //se extraen los valores r,s y v de la firma
                  r = '0x' + signature.slice(2, 66);
                  s = '0x' + signature.slice(66, 130);
                  v = '0x' + signature.slice(130, 132);
                  console.log(signature);
                  console.log(r);
                  console.log(s);
                  console.log(v);
                  console.log('ahora llama funcion finished hash= '+hash+' precio= '+_sellerPrice);
                  web3.eth.contract(abi).at(address).finished(_sellerPrice, hash, v, r, s, function(err, result){//se ejecuta la función de finalización del contrato
                    console.log(_sellerPrice);
                    console.log(hash);
                    trHash = result;
                    console.log(err);
                    console.log(result);
                    if(typeof result!=='undefined'){//la transacción se ha ejecutado
                      alert("Finalized purchase. The transaction have to be mined. This process can take a few minuts. Ethers will be deposited in the seller's account when the transaction is mined. ");
                      document.getElementById("finished").disabled = true;
                      document.getElementById("finished").innerHTML = "You can't finalize again.";
                    }else{
                      alert('Error finalizing the purchase. '+err);
                    }
                    waitForReceipt(trHash, function () {
                      console.log("Transaction succeeded.");
                    });
                  });
                }
              });
            }else{
              alert('The price that the buyer is willing to pay is not the same price that the seller wants to charge.\n Please seller, if you do not agree with the price that the buyer is willing to pay, do not end this process.\nBuyer price: '+_buyerPrice/1000000000000000000+'\nSeller price: '+_sellerPrice/1000000000000000000);
              document.getElementById('sellerPrice').style.background = 'red';
              document.getElementById("sellerPrice").onclick = function() {white()};
            }
          }
});

//función web3 para firmar
function sign(cb) {
  var messageToSign='Order: '+ address +'\n\nDate: '+ date +'\n\nBuyer address: '+_comprador+'\n\nSeller address: '+_vendedor+'\n\nCost (ethers): '
  +_sellerPrice/1000000000000000000;//se genera el mensaje que enviará el comprador al vendedor
  console.log(messageToSign);
  hash = web3.sha3(messageToSign);//se raliza el hash del mensaje
  web3.eth.sign(web3.eth.accounts[0], hash, function(err, res){//se realiza la firma sobre el hash del mensaje
    console.log(err,res);
    if(typeof res!=='undefined'){//la firma se ha realizado
      signature=res;
      cb(signature);
      console.log(signature);
      console.log(hash);
      alert('Message signed by the seller. ');
    }else{
      alert('Error signing the message. '+err);
    }
  });
}

function white() {
  document.getElementById("sellerPrice").style.background = 'white';
}

//función web3 que indicará cuando la transacción de finalización se haya confirmado en la blockchain
function waitForReceipt(trHash, cb) {
  web3.eth.getTransactionReceipt(trHash, function (err, receipt) {
    if (err) {
      error(err);
      alert('Error in the mining process. '+err);
    }
    if ((receipt !== null)&&(finish=='false')) {//la transacción se ha minado
      finish='true';
      recibo=receipt;
      console.log(recibo);
      console.log('mineeeeeeeed!!!!');
      alert("Finished Transaction mined! Ethers will be deposited in the seller's account.");
      document.getElementById('recibo').value = 'Order: '+ address +'\n\nDate: '+ date +'\n\nBuyer address: '+_comprador+'\n\nSeller address: '+_vendedor+'\n\nCost (ethers): '
      +_sellerPrice/1000000000000000000
      +'\n\nSeller sign: '+signature;
      document.getElementById("buyer").style.display = "none";
      document.getElementById("seller").style.display = "none";
      // Transaction went through
      if (cb) {
        cb(receipt);
      }
    } else {
      // Try again in 1 second
      window.setTimeout(function () {
        waitForReceipt(trHash, cb);
      }, 1000);
    }
  });
}

//función web3 que indicará cuando la transacción de cancelación se haya confirmado en la blockchain
function waitForCancelReceipt(trHash1, cb) {
  web3.eth.getTransactionReceipt(trHash1, function (err, receipt) {
    if (err) {
      error(err);
      alert('Error in the mining process. '+err);
    }
    if ((receipt !== null)&&(finish=='false')) {//la transacción se ha minado
      finish='true';
      recibo=receipt;
      console.log(recibo);
      console.log('mineeeeeeeed!!!!');
      alert("Cancel Transaction mined! Ethers will be deposited in the buyer's account.");
      document.getElementById('recibo').value = 'Operation cancelled by the buyer. Cancel transaction is first mined!';
      document.getElementById("buyer").style.display = "none";
      document.getElementById("seller").style.display = "none";
      // Transaction went through
      if (cb) {
        cb(receipt);
      }
    } else {
      // Try again in 1 second
      window.setTimeout(function () {
        waitForCancelReceipt(trHash1, cb);
      }, 1000);
    }
  });
}
