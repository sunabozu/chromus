fs = require('fs')

page = new WebPage()


waitFor = (testFx, onReady, timeOutMillis=30000) ->
    start = new Date().getTime()
    condition = false
    f = ->
        if (new Date().getTime() - start < timeOutMillis) and not condition
            # If not time-out yet and condition not yet fulfilled
            condition = (if typeof testFx is 'string' then eval testFx else testFx()) #< defensive code
        else
            if not condition
                # If condition still not fulfilled (timeout but condition is 'false')

                page_dom = page.evaluate -> 
                    document.getElementById('background_page').contentWindow.document.body.querySelector('.finished-at').length
                
                bg_page = page.evaluate ->
                    document.getElementById('background_page').contentWindow.document.body.innerHTML

                console.log "'waitFor()' timeout", page_dom, bg_page
                
                phantom.exit(1)
            else
                # Condition fulfilled (timeout and/or condition is 'true')
                console.log "'waitFor()' finished in #{new Date().getTime() - start}ms."
                if typeof onReady is 'string' then eval onReady else onReady() #< Do what it's supposed to do once the condition is fulfilled
                clearInterval interval #< Stop this interval
    interval = setInterval f, 1000 #< repeat check every 100ms

page.onConsoleMessage = (msg) ->
    console.log(msg)

file_name = fs.absolute(phantom.args[0]) + "?test_mode"

page.open file_name, (status) ->
    if status isnt "success"
        console.log "Unable to access network"
        phantom.exit(1)
    else
        waitFor ->
            page.evaluate ->
                if document.getElementById('background_page').contentWindow.document.body.querySelector('.finished-at')
                    return true                
                return false;
        , ->
            passed = page.evaluate ->                
                passed = 0

                list = document.getElementById('background_page').contentWindow.document.querySelectorAll('div.jasmine_reporter >div.suite.failed')

                for el in list
                    passed = 1                   

                    descs = el.querySelectorAll('.description')
                    for desc in descs
                        console.error desc.innerText

                passed


            phantom.exit(passed);
