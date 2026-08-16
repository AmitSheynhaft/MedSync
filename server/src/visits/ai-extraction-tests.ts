import { SummaryService } from './summary.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env file
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

// Test cases with different visit scenarios
const testCases = [
  {
    name: 'Clear Sore Throat Visit',
    description: 'Well-documented throat infection with clear vitals and medicines',
    transcript: `
      שלום, ברוכה הבאה. בואנו נתחיל מהבדיקה הבסיסית. איך אתם מרגישים?
      שלום דוקטור, כואב לי הגרון כבר שלוש ימים, ויש לי גם חום מעל 38 מעלות. נורא קשה לבלוע.
      מה עוד יש לך?
      גם כוחלת קצת בעגלגל, וכאב בראש.
      בסדר, בואנו נמדוד את הסימנים החיוניים שלך.
      לחץ דם 120 על 80, דופק 82, חום 38.5 מעלות צלזיוס, משקל 68 קילוגרם, גובה 165 סנטימטר, רוויית חמצן 98 אחוז.
      אני רואה דלקת בגרון וגם קצת בטחינות. הזקק שלך מנופח.
      זה נראה כמו דלקת שקדים בגרום.
      זה חמור?
      לא חמור, אבל צריך לטפל בזה בעבודה.
      אני נותן לך אנטיביוטיקה, אמוקסיצילין 500 מיליגרם, שלוש פעמים ביום, במשך עשרה ימים.
      גם תקחי אספירין 500 מ"ג פעמיים ביום לכאב ולחום.
      וגם משחה בגרון, משחה סטרואידית, פעמיים ביום.
      ואם לא ייעבור?
      אם לא ייעבור בעוד שלוש ימים או זה יחמיר, אתה חייבת לחזור אליי.
      בינתיים - מנוחה, שתיית נוזלים הרבה, דברים קרים לגרון.
      בסדר, תודה רב.
    `,
  },
  {
    name: 'Stomach Issues Visit',
    description: 'Gastric problem with multiple medications and dietary advice',
    transcript: `
      בוקר טוב, בואנו נתחיל. מה קורה איתך?
      בוקר טוב דוקטור. בשלושה ימים האחרונים הרגשתי חלש מאד, קצת בחילות. קשה לי לאכול.
      למשך כמה זמן בדיוק?
      כמעט שלושה ימים. זה התחיל ביום שני בבוקר. גם יש לי כאב בטן, בעיקר בצד ימין.
      האם היה לך כאב ראש או חום?
      כן, חום. היום בבוקר הייתה לי תחושה שיש לי קדחת. וגם כאב מעט בראש.
      בואנו נבדוק את סימניך החיוניים. אני מודד עכשיו.
      לחץ דם: 118 על 76. דופק: 88. חום גוף: 38.2 מעלות צלזיוס. משקל: 72 קילוגרם. גובה: 172 סנטימטר. רוויית חמצן: 99%.
      אני מרגיש בחזה שלך. הנשמה טובה. הבטן שלך קצת כואבת בצד ימין?
      כן, בדיוק שם.
      זה עשוי להיות דלקת בתיאבון או משהו בקיבה. אולי גם קשור לקיבה.
      אני חושב שזו דלקת קיבה או מיד דלקת תיאבון אפשרית. צריך לעשות בדיקות דם בשביל להיות בטוח.
      בינתיים אני נותן לך אומפרזול 20 מיליגרם, פעם אחת ביום בבוקר, לפני אכילה, למשך שלוש שבועות.
      גם אני נותן לך מטרונידזול, זה אנטיביוטיקה, 500 מיליגרם, שלוש פעמים ביום, אחרי אכילה, למשך שבוע.
      ושתי התרופות ביחד זה בסדר?
      כן, זה בסדר. אתה יכול לקחת אותן ביחד.
      ומה עם האכילה?
      דיאטה קלה. אין מזון חריף, אין שומן, אין קפה, אין אלכוהול. אוכל רך ועדין. יוגורט, חלב, מרק.
      תחזור אלי בעוד שבוע ליום הבדיקה. אם יהיו בעיות או זה לא ישתפר, בא מוקדם יותר.
      בסדר. ותודה לך.
    `,
  },
  {
    name: 'Messy/Unclear Visit',
    description: 'Vague measurements, unclear diagnosis, unclear medicine names',
    transcript: `
      בואנו נתחיל, איך אתה?
      חום, כואב לי משהו, לא יודע בדיוק איפה, אולי בטן אולי בגב...
      בואנו נמדוד. אה, המד לא עובד טוב, אני מודד שוב... זה בערך 37 וחצי? או אולי 38?
      ומה עם לחץ דם?
      אה כן, אני מודד... בערך 125 או 130... סביבי 80 למטה... לא בדיוק יודע
      דופק... בערך 75, או 76, משהו כזה
      ומשקל?
      אתה שוקל בערך... איזה 80? 82? לא בטוח, המשקל השקע לא מדויק
      טוב, אני חושב שיש לך קצת דלקת ברקע... או זה קשור לשיתוק? לא בדיוק יודע
      אז מה אתה קובע?
      אני לא בטוח, צריך בדיקות, אבל בינתיים כדור כלשהו יעזור
      איזה כדור?
      פנטוליום? או משהו דומה... דור כלשהו, חבל שלא זוכר את השם בדיוק...
      תצרוך אותו, כמו פעם ביום? או שתיים? לא יודע, בערך ביום...
      ולמשך כמה זמן?
      אה... שבוע? שבועיים? בואנו נגיד שלוש שבועות כדי להיות בטוח
      ובעוד כמה זמן אחזור?
      אם יחמיר או משהו, בעוד שבוע או שבועיים... או באפריל... לא זוכר
    `,
  },
  {
    name: 'Hypertension Follow-up',
    description: 'Blood pressure management with antihypertensive medications',
    transcript: `
      כמו כן לבדיקה. איך הרגשת את עצמך מאז הבקר האחרון?
      בעיקר בסדר, אבל עדיין יש לי כאב ראש קל כשאני קם בבוקר.
      האם נטלת את הטבליות כמו שציוויתי?
      כן, כל יום בבוקר אומפריל 10 מיליגרם וביסופרולול 5 מיליגרם.
      טוב. בואנו נמדוד את לחץ הדם שלך.
      לחץ דם 135 על 85, דופק 70, חום גוף 36.7 מעלות צלזיוס, משקל 85 קילוגרם, גובה 175 סנטימטר, רוויית חמצן 99 אחוז.
      הלחץ דם שלך עדיין גבוה. אני רוצה להוסיף את הידרוכלורוטיאזיד 25 מיליגרם פעם ביום בצהריים.
      ממש 25 מיליגרם?
      כן, 25 מיליגרם. ממשיך גם אומפריל וביסופרולול. התרופות השלוש ביחד בסדר.
      מה עם הדיאטה?
      להמשיך בדיאטה ללא מלח. לא יותר מ-3 גרם מלח ביום. מעט קפה, שתיית מים הרבה.
      מתי אחזור?
      חודש מעכשיו לבדיקה. אם יש בעיות, כאב ראש חמור או בחזה, בא מיד.
      בסדר, תודה רב.
    `,
  },
  {
    name: 'Very Short / Minimal Visit',
    description: 'Quick follow-up with minimal information and few vitals',
    transcript: `
      בואנו נבדוק. הכל בסדר?
      כן, הכל בסדר.
      לחץ דם 115 על 78, דופק 75. נשמעת טוב.
      קח פרצטמול 500 מ"ג אם יהיה כאב ראש.
      בסדר, תודה.
      בעוד שלוש שבועות תחזור.
    `,
  },
  {
    name: 'Confusing / Contradictory Dialogue',
    description: 'Doctor changes mind, unclear measurements, mixed symptoms',
    transcript: `
      אז מה בעיה?
      כאב בטן, או אולי זה משהו אחר.
      אתה אומר כאב בטן או לא?
      כן, בטן. אבל גם לחץ דם. או לא, בעצם לא זוכר.
      בואנו נמדוד. חום 36.5, או 37, המד ישן. דופק בערך 80, או 85. משקל לא מודד.
      אני חושב שזה דלקת. או אלרגיה. בעצם, יכול להיות משהו אחר לגמרי.
      אני ממליץ על טבליה. או שתיים. לא יודע כמה. כלאקלור? או סומק? איזו תרופה טובה, לא זוכר.
      גם נוזלים הרבה. או פחות. בעצם, אכל בקלות.
      תחזור אם לא יעבור. או בעוד שבועיים. או לא צריך לחזור אם טוב.
    `,
  },
  {
    name: 'Long Rambling Visit with Jargon & Slang Mix',
    description: 'Complex medical terminology mixed with colloquial Hebrew, very detailed',
    transcript: `
      אז השמעת אותי נכון? יש לנו כאן מצב של צריחת דרכי הנשימה העליונות, זה חיידקי כמו שרואים בדוגמות.
      כן, זה כואב.
      בדיוק. לחץ הדם שלך 128 על 82, זה קצת גבוה. הדופק 76, זה בסדר. החום 37.8, לא גבוה מדי. משקל 70, גובה 170. רוויית חמצן 97, תקינה לחלוטין.
      כל הסימנים טובים, אבל הזיהום הזה צריך טיפול מיד.
      מה יעזור?
      אני נותן לך אז ארתרוציקלין, זה מקבוצת המקרוליידים, 500 מיליגרם, תקח ארבע פעמים ביום, למשך שלוש שבועות ימים.
      וגם נתתי לך תוספים של ויטמין C, תיקח שתי טבליות ביום, בבוקר ובערב, עד שתרגיש שמרפא.
      וגם, זה חשוב, מגוח זה הנוסחה הקלסית, כמו שציינתי בספרות הרפואית, אתה צריך להימנע מחלב, צור דלקה במערכת.
      עדיף מרק, ביצים, סלט ירוק, מיץ זי לימון, זה ישפר את הדברים.
      יש לך שאלות?
      לא, הבנתי.
      בחזרה בעוד דקה שבועות. אם יהיה חום גבוה או הנשמה קשה, בא לחדר המיון.
      בסדר, תודה רפואי.
    `,
  },
];

async function runAllTests() {
  const configService = new ConfigService();
  const summaryService = new SummaryService(configService);

  // Initialize the service (loads Gemini API key)
  await summaryService.onModuleInit();

  const allResults = [];

  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  🔬 AI Extraction Multi-Test Suite                          ║');
  console.log('║     Running ' + testCases.length + ' different visit scenarios              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n');

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const testNum = i + 1;

    console.log('─'.repeat(62));
    console.log(`\n📋 TEST #${testNum}/${testCases.length}: ${testCase.name}`);
    console.log(`Description: ${testCase.description}\n`);

    try {
      console.log('⏳ Sending to Gemini AI...\n');

      const result = await summaryService.generateStructuredVisitSummary(testCase.transcript.trim());

      console.log('✅ AI Extraction Results:\n');
      console.log(`  👤 Patient Complaints: ${result.patientComplaints.substring(0, 60)}${result.patientComplaints.length > 60 ? '...' : ''}`);
      console.log(`  🏥 Diagnosis: ${result.diagnosis.substring(0, 60)}${result.diagnosis.length > 60 ? '...' : ''}`);
      console.log(
        `  💊 Recommendations: ${result.doctorsRecommendations.substring(0, 60)}${result.doctorsRecommendations.length > 60 ? '...' : ''}`,
      );

      if (result.vitals) {
        const vitalCount = Object.values(result.vitals).filter((v) => v).length;
        console.log(`  📏 Vitals Extracted: ${vitalCount}/6 fields`);
      }

      if (result.medicines && result.medicines.length > 0) {
        console.log(`  💊 Medicines: ${result.medicines.length} found`);
        result.medicines.forEach((med) => {
          console.log(`     - ${med.name} (${med.dosage}, ${med.frequency}, ${med.duration})`);
        });
      }

      if (result.diagnoses && result.diagnoses.length > 0) {
        console.log(`  🔬 Diagnoses: ${result.diagnoses.length} found`);
        result.diagnoses.forEach((diag) => {
          console.log(`     - ${diag.description}${diag.note ? ` (${diag.note})` : ''}`);
        });
      }

      allResults.push({
        testNumber: testNum,
        testName: testCase.name,
        status: 'PASS',
        result,
      });

      console.log('\n✨ Test passed!');
    } catch (error) {
      console.error(
        '\n❌ Test failed:',
        error instanceof Error ? error.message : 'Unknown error',
      );

      allResults.push({
        testNumber: testNum,
        testName: testCase.name,
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    console.log('');
  }

  // Summary
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  📊 TEST SUMMARY                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n');

  const passCount = allResults.filter((r) => r.status === 'PASS').length;
  const failCount = allResults.filter((r) => r.status === 'FAIL').length;

  allResults.forEach((result) => {
    const icon = result.status === 'PASS' ? '✅' : '❌';
    console.log(`  ${icon} Test #${result.testNumber}: ${result.testName} - ${result.status}`);
  });

  console.log(`\n  Total: ${testCases.length} | Passed: ${passCount} | Failed: ${failCount}`);
  console.log('\n');

  // Save all results to file
  const outputPath = path.join(__dirname, 'ai-extraction-batch-results.json');
  const outputData = {
    timestamp: new Date().toISOString(),
    totalTests: testCases.length,
    passed: passCount,
    failed: failCount,
    tests: allResults.map((r) => ({
      testNumber: r.testNumber,
      testName: r.testName,
      status: r.status,
      ...(r.result ? { extraction: r.result } : { error: r.error }),
    })),
  };

  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');
  console.log(`📁 Results saved to: ${outputPath}`);
  console.log('\n');
}

// Run all tests
runAllTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
