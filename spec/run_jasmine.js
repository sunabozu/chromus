(function() {
  var file_name, fs, page, waitFor;

  fs = require('fs');

  page = new WebPage();

  waitFor = function(testFx, onReady, timeOutMillis) {
    var condition, f, interval, start;
    if (timeOutMillis == null) timeOutMillis = 30000;
    start = new Date().getTime();
    condition = false;
    f = function() {
      var bg_page, page_dom;
      if ((new Date().getTime() - start < timeOutMillis) && !condition) {
        return condition = (typeof testFx === 'string' ? eval(testFx) : testFx());
      } else {
        if (!condition) {
          page_dom = page.evaluate(function() {
            return document.getElementById('background_page').contentWindow.document.body.querySelector('.finished-at').length;
          });
          bg_page = page.evaluate(function() {
            return document.getElementById('background_page').contentWindow.document.body.innerHTML;
          });
          console.log("'waitFor()' timeout", page_dom, bg_page);
          return phantom.exit(1);
        } else {
          console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
          if (typeof onReady === 'string') {
            eval(onReady);
          } else {
            onReady();
          }
          return clearInterval(interval);
        }
      }
    };
    return interval = setInterval(f, 1000);
  };

  page.onConsoleMessage = function(msg) {
    return console.log(msg);
  };

  file_name = fs.absolute(phantom.args[0]) + "?test_mode";

  page.open(file_name, function(status) {
    if (status !== "success") {
      console.log("Unable to access network");
      return phantom.exit(1);
    } else {
      return waitFor(function() {
        return page.evaluate(function() {
          if (document.getElementById('background_page').contentWindow.document.body.querySelector('.finished-at')) {
            return true;
          }
          return false;
        });
      }, function() {
        var passed;
        passed = page.evaluate(function() {
          var desc, descs, el, list, _i, _j, _len, _len2;
          passed = 0;
          list = document.getElementById('background_page').contentWindow.document.querySelectorAll('div.jasmine_reporter >div.suite.failed');
          for (_i = 0, _len = list.length; _i < _len; _i++) {
            el = list[_i];
            passed = 1;
            descs = el.querySelectorAll('.description');
            for (_j = 0, _len2 = descs.length; _j < _len2; _j++) {
              desc = descs[_j];
              console.error(desc.innerText);
            }
          }
          return passed;
        });
        return phantom.exit(passed);
      });
    }
  });

}).call(this);
