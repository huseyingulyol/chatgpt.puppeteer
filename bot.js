const puppeteer = require("puppeteer");
require('dotenv').config();

(async () => {
  // Tarayıcıyı başlat
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: process.env.BROWSER_LOCATION, // Chrome'un yolu
    args: [
      `--user-data-dir=${process.env.BROWSER_USERDATA}`, // Profil dizininin yolu
      "--profile-directory=Default", // Varsayılan profil
      "--disable-blink-features=AutomationControlled", // Bu bayrak otomasyon kontrolünü devre dışı bırakır
    ],
    defaultViewport: null,
  });
  const pagePercipio = (await browser.pages())[0];
  const pageChatGPT = await browser.newPage();

  await pagePercipio.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
  );
  await pageChatGPT.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
  );

  pagePercipio.bringToFront();
  
  // İlk sekmede bir sayfaya git
  await pagePercipio.goto("https://tobeto.percipio.com/login#/classic");

  await pagePercipio.waitForSelector("input#loginName");
  await pagePercipio.click("input#loginName");
  await pagePercipio.type("input#loginName", process.env.PERCIPIO_EMAIL);

  await pagePercipio.waitForSelector(
    "button.Button---root---2BQqW.Button---primary---1O3lq.Button---small---3PMLN.Button---center---13Oaw"
  );
  await pagePercipio.click(
    "button.Button---root---2BQqW.Button---primary---1O3lq.Button---small---3PMLN.Button---center---13Oaw"
  );

  await pagePercipio.waitForSelector('input[type="password"]');
  await pagePercipio.type('input[type="password"]', process.env.PERCIPIO_PASSWORD);

  await pagePercipio.waitForSelector(
    'button.Button---root---2BQqW.Button---primary---1O3lq.Button---small---3PMLN.Button---center---13Oaw[type="submit"]'
  );
  await pagePercipio.click(
    'button.Button---root---2BQqW.Button---primary---1O3lq.Button---small---3PMLN.Button---center---13Oaw[type="submit"]'
  );

  // İkinci sekmede bir sayfaya git
  await pageChatGPT.goto("https://chatgpt.com");

  let previousUrl = ""; // Önceki URL'yi saklamak için bir değişken
  let isStarted = false;
  let counterQuestion = "";

  browser.on("targetcreated", async (target) => {
    if (target.type() === "page") {
      // Hedef bir sayfa mı kontrol edin
      const newPage = await target.page(); // Yeni açılan sayfa

      if (newPage) {
        newPage.on("framenavigated", async () => {
          const currentUrl = await newPage.url();

          // // Sayfanın tam olarak yüklenmesini bekle
          // await newPage.waitForNavigation({ waitUntil: "domcontentloaded" });

          if (currentUrl === previousUrl) {
            console.log("URL değişmedi. İşlem yapılmıyor.");
            return;
          }

          console.log("Dostum sayfa değişti:", currentUrl); // Node.js konsoluna yazdır
          previousUrl = currentUrl;

          // Tarayıcı konsoluna yazdır
          await newPage.evaluate((message) => {
            console.log(message); // Tarayıcı konsoluna yazdır
          }, `Dostum sayfa değişti: ${currentUrl}`);

          if (currentUrl.includes("/exercises/")) {
            isStarted = await newPage.evaluate(() => {
              //@@@@@@@@@@@@@@@@@@@@@@@@@BROWSER_CONTEXT@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

              let isStartExerciseSolver = false;

              function delay(ms) {return new Promise(resolve => setTimeout(resolve, ms));}

              async function checkElement(querySelectorText)
              {

                  try {
                      var element = document.querySelector(querySelectorText)
                      if (element == null)
                      {
                        return false;
                      }
                      else
                      {
                        if (element.ariaDisabled == null )
                        {
                          if (element.disabled == undefined)
                          {
                            return true;
                          }
                          else
                          {
                            if (element.disabled == false) return true; // button aktif
                            else return false;
                          }

                        }
                        else
                        {
                          if (element.disabled == false && element.ariaDisabled == 'false') return true; // aktifse
                          else return false;
                        }
                      }
                  }
                  catch (error) {
                      return false; // Hata durumunda boş string döndür
                  }
              }

              async function checkElementAndClick(querySelectorText)
              {
                while (!(await checkElement(querySelectorText))){
                  console.log("bekleniyor: "  + querySelectorText);
                  await delay(100);
                }
                await delay(100);
                document.querySelector(querySelectorText).click()
                console.log("bitti: " + querySelectorText);
              }

              async function checkButtonTextsAndClick(text) {
                while (isStartExerciseSolver)
                {
                  console.log("bekleniyorV2: " + text);
                  const buttons = document.querySelectorAll('button');

                  for (const button of buttons) {
                      if (button.textContent.includes(text)) {
                          button.click();
                          await delay(500);
                          return;
                      }
                  }
                  await delay(200);
                }
                console.log("bittiV2: " + text);
              }

              async function checkElementsText(text) {

                  console.log("bekleniyorV2: " + text);
                  const buttons = document.querySelectorAll('button');

                  for (const button of buttons) {
                      if (button.textContent.includes(text)) {
                          return true;
                      }
                  }
                  await delay(200);

                console.log("bittiV2: " + text);

              }

              async function loop()
              {
                while(isStartExerciseSolver)
                {

                  while ((await checkElement('button[id*="discovery-next"]')))
                  {
                    if (await checkElementsText("Up Next"))
                    {
                      await checkElementAndClick('button[id*="discovery-next"]');
                      return isStartExerciseSolver;
                    }
                    else
                    {
                      console.log("ilerledim.");
                      await checkElementAndClick('button[id*="discovery-next"]');
                      await delay(1000);
                    }

                  }

                  await checkElementAndClick('button[data-testid*="run-button"]');
                  await delay(300);
                  await checkElementAndClick('button[data-testid*="run-button"]');
                  await delay(300);
                  await checkElementAndClick('button[data-testid*="view-solution-button"]');
                  await delay(300);
                  await checkButtonTextsAndClick("Replace");
                  await delay(300);
                }

              }

              async function StartExerciseSolver() {
                isStartExerciseSolver = true;
                await loop();
              }

              async function StopExerciseSolver() {
                isStartExerciseSolver = false;
              }

              const button = document.createElement('button');
              button.id = 'dynamic-start-button'; // Butona id atayarak kontrolü kolaylaştır
              button.textContent = 'START EXERCISE SOLVER';
              button.style.position = 'fixed';
              button.style.bottom = '20px';
              button.style.right = '20px';
              button.style.padding = '10px 20px';
              button.style.backgroundColor = 'green'; // Buton rengi
              button.style.color = 'white';
              button.style.border = 'none';
              button.style.borderRadius = '5px';
              button.style.cursor = 'pointer';
              button.style.zIndex = '1000'; // Diğer öğelerin üstünde görünsün
              document.body.appendChild(button);

              button.addEventListener('click', async () => {
                if (!isStartExerciseSolver)
                {
                  button.style.backgroundColor = "red";
                  button.textContent = "STOP EXERCISE SOLVER";
                  await StartExerciseSolver();

                }
                else
                {
                  button.style.backgroundColor = "green";
                  button.textContent = "START EXERCISE SOLVER";
                  await StopExerciseSolver();
                }
              });
            //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
            });
          }


          if (currentUrl.includes("/quizzes/")) 
          {
            isStarted = true;
  
            while (isStarted) 
            {
              let counterSplited = counterQuestion.replaceAll(' ','').split('/');
              if (counterSplited[0] === counterSplited[1]){
                console.log("son soru olduğu algılandı, durduruluyor...");
                isStarted = false;
                break;
              }

              console.log("Counter bekleniyor... Şuanki Counter:", counterQuestion);
              await newPage.waitForSelector("span[aria-label*='Question'");
              
              console.log("Counter bulundu, farklı olması bekleniyor...");

              await newPage.waitForFunction((exceptedValue) => document.querySelector("span[aria-label*='Question']").textContent != exceptedValue,{}, counterQuestion);

              console.log("Counter farklı, devam ediyorum.");
              counterQuestion = await newPage.evaluate(async () => { return document.querySelector("span[aria-label*='Question']").textContent });
              console.log("Yeni Counter: ", counterQuestion);


              const generateRandomId = () => {
                return Math.random().toString(36).substr(2, 9);
              };
              
              const randomId = generateRandomId();
              await newPage.screenshot({ path: `screenshoot_${randomId}_${counterQuestion.replace('/','-')}.png` });


              //EĞER BOŞLUK DOLDURMAYSA ÇÖZ.
              console.log("Blank işlemiyse yap.");
              let isFillBlankQuestion = await newPage.evaluate(async () => {
                function delay(ms) {return new Promise(resolve => setTimeout(resolve, ms));}

                let textContent = document.body.innerText || document.body.textContent;
                textContent = textContent.toLowerCase();
                var result = /fill in the blank/i.test(textContent)  && /blank/i.test(textContent) && /drag/i.test(textContent) ;

                if (result)
                {
                  const elements = document.querySelectorAll("button[data-flip-id*='correct']");

                  // Elementleri ID'nin son hanesine göre sırala
                  const sortedElements = Array.from(elements).sort((a, b) => {
                      const idA = a.getAttribute('data-flip-id');
                      const idB = b.getAttribute('data-flip-id');
                      
                      const lastDigitA = parseInt(idA.slice(-1), 10);
                      const lastDigitB = parseInt(idB.slice(-1), 10);
                      
                      return lastDigitA - lastDigitB;
                  });
                  
                  sortedElements.forEach(async (element, index) => {
                    await delay(1000);
                    element.click(); // Elementi tıklat
                    console.log(`Element ${index + 1} tıklatıldı:`, element);
                  });
                }

                return result;
              });

              console.log("Blank mi?");
              if (!isFillBlankQuestion)
              {
                console.log("Blank değil, normal soru devam ediyorum.");
                //Butonların yüklenmesini bekle.
                await newPage.waitForFunction(() => document.querySelectorAll("button[data-testid*='multiple-choice-answer']").length >= 3);
                console.log("Tüm butonlar yüklendi.");

                //SORUYU AL
                let question = await newPage.evaluate(() => {
                  return `
                        Sana tüm sayfadaki metni veriyorum. Burda en başta bir soru ondan sonrada 4 şık var ve şıkların ıd'si var.
                        Senden istediğim şu; aşağıdaki formata uygun şeklinde cevaba ait id'nin sondaki numarasını aşağıdaki "(id)" kısmına yaz. Başka ekstra hiçbir şey ekleme.
                        Cevap formatı: multiple-choice-answer-(id)

                        Tüm sayfa metni:
                        ${document.querySelector("main").textContent}
                        Cevap şıkları:
                        ${Array.from(
                          document.querySelectorAll(
                            'button[data-testid*="multiple-choice-answer"]'
                          )
                        )
                          .map(
                            (x) =>
                              `\nID: ${x.getAttribute("data-testid")}\n${x.textContent}`
                          )
                          .join("\n")}
                    `;
                });
              
                //CEVABI ÖĞREN
                pageChatGPT.bringToFront();
                let answer = await pageChatGPT.evaluate(async (message) => {

                  function delay(ms) {return new Promise((resolve) => setTimeout(resolve, ms));}

                  await delay(1000);

                  const input = document.querySelector('textarea[id*="prompt-textarea"]');
                  input.focus();
                  const event = new Event("input", { bubbles: true });
                  input.value = message;
                  input.dispatchEvent(event);

                  await delay(500);

                  document.querySelector("button[data-testid*='send-button']").click();

                  await delay(2000);

                  let answerChatGPT = document.querySelectorAll("div[data-message-author-role='assistant']")
                  [document.querySelectorAll("div[data-message-author-role='assistant']").length - 1].textContent;

                  await delay(500);

                  console.log(answerChatGPT);

                  return answerChatGPT;
                }, question);

                answer = answer.trim().replace(' ','');


                // CEVABI İŞARETLE
                console.log("Cevabı işaretliyorum. cevap: ", answer);
                newPage.bringToFront();
                await newPage.click(`button[data-testid*="${answer.trim()}"]`);
                

              }
              else
              {
                // CHECKANSWER'E TIKLA
                console.log("Check answere'e basıyorum.");

                await newPage.waitForFunction(() => document.querySelector("button[data-testid*='quiz-button-cta']").disabled == false);
                await newPage.click('button[data-testid*="quiz-button-cta"]');
              }

              // NEXT TUŞUNA TIKLA
              console.log("Next'e basıyorum.");

              await newPage.waitForFunction(() => document.querySelector("button[data-testid*='quiz-button-cta']").disabled == false);
              await newPage.click('button[data-testid*="quiz-button-cta"]');

             
              
            }
          }
        });
      }
    }
  });

  pagePercipio.bringToFront();
  // Tarayıcıyı kapatma işlemi, test süresine bağlı olarak açabilirsiniz
  // await browser.close(); // Test aşamasında kapatmayabilirsiniz
})();
