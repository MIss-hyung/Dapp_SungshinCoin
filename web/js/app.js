App = {
    web3Provider: null, //web3연결 (프론트에서 블록체인과 연결을 하겠습니다)
    contracts: {},
    account: '0x0',
    App_account: '0x0',
    AppSale_account: '0x0',
    loading: false,
    tokenPrice: 1000000000000000,
    tokensSold: 0,
    tokensAvailable: 920000,

    init: function () {
        console.log("init() 실행");
        return App.initWeb3();
    },

    initWeb3: function () { //web3 연결!!!
        console.log("initWeb3() 실행");

        // var web3;

        if (typeof web3 !== 'undefined') {
            console.log("web3에 현재 사용자 가져오기");
            //메타마스크 존재하면(주어진 web3인스턴스 있다면)
            App.web3Provider = web3.currentProvider; //현재 사용자를 가져온다.
            web3 = new Web3(web3.currentProvider); //web3에 담는다.

        } else {
            console.log("Web3없으면 알아서 접속해서 가나슈 실행");
            //이 rpc서버를 제공하는 local공급자가 가나슈이면 가나슈가 실행
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);
        }

        return App.initContracts();

    }, //dapp에서 쓸수있는 web3환경 조성


    initContracts: function () {
        console.log("initContracts() 실행");

        $.getJSON("DappTokenSale.json", function (dappTokenSale) {
            console.log("initContracts() 안의 익명함수 1 실행");
            //artifact파일 abi정보와 컨트랙트 배포 주소 갖고 있음
            //크라우드세일의 주소를 가지고 오기
            App.contracts.DappTokenSale = TruffleContract(dappTokenSale); // 객체화
            App.contracts.DappTokenSale.setProvider(App.web3Provider); // 프론트에 쓸 거다

            App.contracts.DappTokenSale.deployed().then(function (dappTokenSale) {
                console.log("initContracts() 안의 익명함수 2 실행");
                console.log("Token Crowdsale Address:", dappTokenSale.address);
                App.AppSale_account = dappTokenSale.address; // 변수에 담음
                console.log("Token Crowdsale Address:", App.AppSale_account);
            });

        }).done(function () {

            $.getJSON("DappToken.json", function (dappToken) {
                console.log("initContracts() 안의 익명함수 3 실행");
                //토큰이의 주소 가지고 오기
                App.contracts.DappToken = TruffleContract(dappToken);
                App.contracts.DappToken.setProvider(App.web3Provider);

                App.contracts.DappToken.deployed().then(function (dappToken) {
                    console.log("initContracts() 안의 익명함수 4 실행");
                    console.log("Token Address:", dappToken.address);
                    App.App_account = dappToken.address;
                    console.log("Token Address:", App.App_account);
                });

                App.listenForEvents();
                return App.render();
            });
        })
    },
    //스마트컨트랙트를 인스턴스화 그래야 web3가 우리 contract 어디서 찾아야하는지 알 수 잇음

    // 컨트랙트에서 부르는 이벤트를 리스닝 한다.
    listenForEvents: function () {
        console.log("listenForEvents() 실행");

        App.contracts.DappTokenSale.deployed().then(function (instance) {
            console.log("listenForEvents() 안의 익명함수 실행");
            instance.Sell({}, {
                fromBlock: 0,
                toBlock: 'latest'
            }).watch(function (error, event) {
                console.log("event triggered", event);
                App.render();
            })
        })
    },

    render: function () {
        console.log("render() 실행");

        if (App.loading) {
            console.log("render() 실행 : App.loading = true");
            return;

        } else {
            console.log("render() 실행 : App.loading = false라서 true로");

            App.loading = true;

            var loader = $('#loader');
            var content = $('#content');

            loader.show();
            content.hide();

            // Load account data
            // web3 통해 연결된 노드 계정 불러와야 사용자의 계정을 가지고 와서 account에 담는다.
            web3.eth.getCoinbase(function (err, account) { // err를 account에 담기
                console.log("getCoinbase() 실행");
                console.log("여기서 account연결" ,  App.account);
                if (err === null) {
                    App.account = account;
                    $('#accountAddress').html(account);
                    console.log("Student Address:", App.account);
                }
            });

            App.contracts.DappTokenSale.deployed().then(function (instance) {
                dappTokenSaleInstance = instance;
                return dappTokenSaleInstance.tokenPrice();

            }).then(function (tokenPrice) {
                App.tokenPrice = tokenPrice;
                console.log("tokenPrice = " + tokenPrice);

                $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
                return dappTokenSaleInstance.tokensSold();

            }).then(function (tokensSold) { // 지금가지 판매한 수정구
                // console.log("담기전 tokensSold = " + App.tokensSold);
                // App.tokensSold = tokensSold.toNumber(); // 숫자로 변환
                // console.log("tokensSold = " + tokensSold.toNumber());
                // console.log("여기는 tokens-sold : " + App.tokensSold);

                $('.tokens-sold').html(App.tokensSold); // 학생의 잔여 수정구

                App.tokensAvailable = 1000000 - App.tokensSold;
                console.log("여기는 totalAvailable : " + App.tokensAvailable);
                $('.tokens-available').html(App.tokensAvailable);

                //$('.tokens-available').html(App.tokensAvailable);
                //console.log("여기는 tokens-avialable : " + App.tokensAvailable);

                /*
                // 토큰컨트랙트
                App.contracts.DappToken.deployed().then(function (instance) {
                    dappTokenInstance = instance;
                    return dappTokenInstance.balanceOf(App.account); // 성신코인의 수정구슬 잔액 아닐까??!!!

                }).then(function (balance) {
                    $('.tokens-available').html(balance.toNumber());
                    console.log("여기는 성신코인 balance : " + balance);
                    App.loading = false;
                    loader.hide();
                    content.show();
                });
*/

                App.contracts.DappToken.deployed().then(function (instance) {
                    dappTokenInstance = instance;
                    return dappTokenInstance.totalSupply(); // 전체 발행량

                }).then(function (totalSupply) {
                    // App.totalTokenSupply = totalSupply.toNumber();
                    $('.dapp-balance').html(totalSupply.toNumber());
                    console.log("여기는 totalSupply : " + totalSupply);
                    App.loading = false;
                    loader.hide();
                    content.show();
                });
            });
        }
    },

    // 이자의 잔액이 있는지 없는지 확인.
    // 돈만 나가면 됨.
    TransferSSTokens: function () {
        var total_bill = $('#total_bill').val();
        App.contracts.DappToken.deployed().then(function (instance) {
            instance.transfer(App.App_account, total_bill);
            if (instance.transfer == false) {
                alert("수정구슬이 부족합니다");
            } else {
                return instance.transfer(App.App_account, total_bill);
            }
        })
    },

    buyTokensHere: function () {
        $('#content').hide();
        $('#loader').show();

        var numberOfTokens = $('#numberOfTokens').val();

        console.log("여기는 numberOfTokens : " + numberOfTokens);
        App.tokensSold += numberOfTokens;
        console.log("여기는 tokensSold 1: " + App.tokensSold);

        App.contracts.DappTokenSale.deployed().then(function (instance) {
            console.log("여기는 app.contracts.dapp 어쩌구 인데    : ", instance);
            var price = web3.toWei(parseFloat(numberOfTokens || 0), "ether");
            console.log("account  1 : " + App.account);
            console.log("price = " + price);
            var price = price/250000;
            console.log("price22 = " + price);

            return instance.buyTokens(price, {
                from: App.account,
                // value: price * App.tokenPrice,
                value: price,
                gas: 500000 // Gas 설정
            });

        }).then(function (result) {
            console.log("여기는 tokensSold 2: " + App.tokensSold);
            $('.tokens-sold').html(App.tokensSold);
            console.log("Tokens bought...");
            $('form').trigger('reset') // reset number of tokens in form
            // Sell event 기다리기.
        });
    }
};

$(function () {
    $(window).load(function () {
        App.init();
    })
});
