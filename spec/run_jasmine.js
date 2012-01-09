page.open(phantom.args[0], function(status){
    if (status !== "success") {
        console.log("Unable to access network");
        phantom.exit();
    } else {
        waitFor(function(){
            return page.evaluate(function(){
                if (document.body.querySelector('.finished-at')) {
                    return true;
                }
                return false;
            });
        }, function(){
            page.evaluate(function(){
                console.log(document.body.querySelector('.description').innerText);
                list = document.body.querySelectorAll('div.jasmine_reporter > div.suite.failed');
                for (i = 0; i < list.length; ++i) {
                    el = list[i];
                    desc = el.querySelectorAll('.description');
                    console.log('');
                    for (j = 0; j < desc.length; ++j) {
                        console.log(desc[j].innerText);
                    }
                }
            });
            phantom.exit();
        });
    }
});