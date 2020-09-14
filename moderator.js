let fs = require('fs');
let cd = require('chromedriver');
let swd = require('selenium-webdriver');
let bldr = new swd.Builder();
let driver = bldr.forBrowser('chrome').build();

let cfile = process.argv[2];
let usrToAdd = process.argv[3];
let qfile = process.argv[4];
let questions = require(qfile);
(async function () {
    try {
        await driver.manage().setTimeouts({
            implicit: 10000,
            pageLoad: 10000
        });

        let contents = await fs.promises.readFile(cfile, 'utf-8');
        let obj = JSON.parse(contents);
        let user = obj.user;
        let pwd = obj.pwd;
        let url = obj.url;

        await driver.get(url);
        let uel = await driver.findElement(swd.By.css('#input-1'));
        let pel = await driver.findElement(swd.By.css('#input-2'));

        await uel.sendKeys(user);
        await pel.sendKeys(pwd);

        let btnLogin = await driver.findElement(swd.By.css(".auth-button"));
        await btnLogin.click();

        let btnAdmin = await driver.findElement(swd.By.css("a[data-analytics=NavBarProfileDropDownAdministration]"));
        let adminurl = await btnAdmin.getAttribute('href');

        await driver.get(adminurl);
        let manageTabs = await driver.findElements(swd.By.css('ul.nav-tabs li'));
        await manageTabs[1].click();

        let curl = await driver.getCurrentUrl();
        console.log(curl);

        let qidx = 0;
        let questionElement = await getQuestionElement(curl, qidx);
        while(qidx!==undefined) {
            // await handleQuestion(questionElement);
            await addTestcase(questionElement,questions[qidx])
            qidx++;
            if(questionElement===undefined)
            {
              break;
            }
            questionElement = await getQuestionElement(curl, qidx);
        }
    }
    catch (err) {
        console.log(err);
    }
})();

async function getQuestionElement(curl, qidx) {
    await driver.get(curl);

    let pidx = parseInt(qidx / 10);
    qidx = qidx % 10;
    console.log(pidx + " " + qidx);

    let paginationBtns = await driver.findElements(swd.By.css('.pagination li'));
    let nextPageBtn = paginationBtns[paginationBtns.length - 2];
    let classOnNextPageBtn = await nextPageBtn.getAttribute('class');
    for (let i = 0; i < pidx; i++) {
        if (classOnNextPageBtn !== 'disabled') {
            await nextPageBtn.click();

            paginationBtns = await driver.findElements(swd.By.css('.pagination li'));
            nextPageBtn = paginationBtns[paginationBtns.length - 2];
            classOnNextPageBtn = await nextPageBtn.getAttribute('class');
        } else {
            return undefined;
        }
    }

    let questionElements = await driver.findElements(swd.By.css('.backbone.block-center'));
    if (qidx < questionElements.length) {
        return questionElements[qidx];
    } else {
        return undefined;
    }
}

async function handleQuestion(questionElement) {
    let qurl = await questionElement.getAttribute('href');
    console.log(qurl);
    
    await questionElement.click();
    // sleepSync(2000); // solution 1 -> if the page is ready before 2 seconds, we are waiting purposelessly, if the page is not ready after 2 seconds, this will fail
    
    // solution 2 - part1 (jugaad approach)
    // let nametext = await driver.findElement(swd.By.css('#name'));
    // await nametext.sendKeys('kuchbhi'); // changing to reliably open the discard popup

    // solution 3 - waiting for tags to load
    await driver.wait(swd.until.elementLocated(swd.By.css('span.tag')));

    let moderatorTab = await driver.findElement(swd.By.css('li[data-tab=moderators]'));
    await moderatorTab.click();

    // solution 2 -> part2
    // let cancelBtn = await driver.wait(swd.until.elementLocated(swd.By.css('#cancelBtn')), 1000);
    // await cancelBtn.click();

    let moderatorTextBox = await driver.findElement(swd.By.css('#moderator'));
    await moderatorTextBox.sendKeys(usrToAdd);
    await moderatorTextBox.sendKeys(swd.Key.ENTER);
    
    let btnSave = await driver.findElement(swd.By.css('.save-challenge'));
    await btnSave.click();
  
}

async function waitUntilLoaderDisappears(){
  
    let loader = await driver.findElement(swd.By.css('#ajax-msg'));
    await driver.wait(swd.until.elementIsNotVisible(loader));
}
async function addTestcase(questionElement, qdata)
{
  try{
    if(questionElement===undefined)
    {
      return;
    }
  console.log('7')
  await waitUntilLoaderDisappears();
  let qurl = await questionElement.getAttribute('href');
  console.log(qurl);
  await questionElement.click();
  await driver.wait(swd.until.elementLocated(swd.By.css('span.tag'))); 
  let TestCaseTab = await driver.findElement(swd.By.css('li[data-tab=testcases]'));
  await TestCaseTab.click();
  let loopcount = (qdata["Testcases"]).length;//number of test cases to be added
  // console.log(loopcount);
  for(let i=0;i<loopcount;i++)
  {
    await driver.wait(swd.until.elementLocated(swd.By.css('.btn.add-testcase.btn-green')));
    let state = qdata["Testcases"][i];
    let addTestcaseButton = await driver.findElement(swd.By.css('.btn.add-testcase.btn-green'));
  await addTestcaseButton.click();

  let inputTA = await driver.findElement(swd.By.css('.formgroup.horizontal.input-testcase-row.row .CodeMirror.cm-s-default.CodeMirror-wrap div textarea'));
  let outputTA = await driver.findElement(swd.By.css('.formgroup.horizontal.output-testcase-row.row .CodeMirror.cm-s-default.CodeMirror-wrap div textarea'));
  let indata = state["Input"];
  let oudata = state["Output"];
  console.log("in data is ",indata);
  console.log("outdata is ",oudata)
  console.log("1")
 await editorHandler('.formgroup.horizontal.input-testcase-row.row .CodeMirror.cm-s-default.CodeMirror-wrap div',inputTA,indata);
 console.log("3")
 await editorHandler('.formgroup.horizontal.output-testcase-row.row .CodeMirror.cm-s-default.CodeMirror-wrap div',outputTA,oudata);
 console.log("4")
  let savebtn = await driver.findElement(swd.By.css('.btn.btn-primary.btn-large.save-testcase'));
//   let fy = (await driver).findElement(swd.By.css('.on-the-fly-dialog-container'))
  await savebtn.click();
  // driver.wait(swd)
  console.log("5");
  let ctime = Date.now();
  while(Date.now()<=ctime+4000)
  {
  }
  // await driver.wait(swd.until.elementLocated(swd.By.css('.save-challenge.btn.btn-green')),5000)
  // let saveChanges = (await driver).findElement(swd.By.css('.save-challenge.btn.btn-green'))
  // await saveChanges.click();
  console.log('8')
  }
}
catch(err)
{
  console.log(err)
}
}
  

async function editorHandler(parentSelector, element, data) {
  let parent = await driver.findElement(swd.By.css(parentSelector));
  // selenium => browser js execute 
  console.log("2")
  await driver.executeScript("arguments[0].style.height='10px'", parent);
  await element.sendKeys(data);
}

function sleepSync(duration){
    let curr = Date.now();
    let limit = curr + duration;
    while(curr < limit){
        curr = Date.now();
    }
}
