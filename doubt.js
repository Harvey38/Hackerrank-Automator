require("chromedriver");
let fs = require("fs");
let swd = require("selenium-webdriver");
let bldr = new swd.Builder();
let driver = bldr.forBrowser("chrome").build();

let cFile= process.argv[2];
let uToadd = process.argv[3];

(async function () {

     await driver.manage().setTimeouts({ implicit: 20000, pageLoad: 20000});
     let data = await fs.promises.readFile(cFile);
     let {url,pwd,user} = JSON.parse(data);
     await driver.get(url);
     let userPromise = driver.findElement(swd.By.css("#input-1"));
     let passPromise = driver.findElement(swd.By.css("#input-2"));
     let uandpassWillbefound = await Promise.all([userPromise,passPromise]);
     let usernameSend = await uandpassWillbefound[0].sendKeys(user);
     let passsend = await uandpassWillbefound[1].sendKeys(pwd);
     await Promise.all([usernameSend,passsend]);
     let loginBtn = await driver.findElement(swd.By.css("button[data-analytics=LoginPassword]"));
     await loginBtn.click();
     let UnameBtn = await driver.findElement(swd.By.css("a[data-analytics=NavBarProfileDropDown]"));
    await UnameBtn.click();
     let adminLinkanchor = await driver.findElement(swd.By.css("a[data-analytics=NavBarProfileDropDownAdministration]"));
     await adminLinkanchor.click();
     let adminLinkAnchor = await driver.findElement(swd.By.css("a[data-analytics=NavBarProfileDropDownAdministration]"));
     adminLinkAnchor.click();
     await waitForLoader();
     let manageTabs = await driver.findElements(swd.By.css(".administration header ul li"));
     await manageTabs[1].click();

     let mPurl = await driver.getCurrentUrl();
     console.log(mPurl)
      let qidx = 0;
      while(true){
          let questions = await goToMyQelement(qidx,mPurl);
          if(questions == null){
              return;
          }
        await handleQuestion(questions,uToadd);
        qidx++;
      } 
})()

async function goToMyQelement(qidx,curl){
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

async function handleQuestion(questionElement,usrToAdd){
    let qurl = await questionElement.getAttribute('href');
    console.log(qurl);
    
    await questionElement.click();
    
    await driver.wait(swd.until.elementLocated(swd.By.css('span.tag')));

    let moderatorTab = await driver.findElement(swd.By.css('li[data-tab=moderators]'));
    await moderatorTab.click();


    let moderatorTextBox = await driver.findElement(swd.By.css('#moderator'));
    await moderatorTextBox.sendKeys(usrToAdd);
    await moderatorTextBox.sendKeys(swd.Key.ENTER);
    
    let btnSave = await driver.findElement(swd.By.css('.save-challenge'));
    await btnSave.click();
  
}


async function waitForLoader() {
    let loader = await driver.findElement(swd.By.css("#ajax-msg"));
    await driver.wait(swd.until.elementIsNotVisible(loader));
  }