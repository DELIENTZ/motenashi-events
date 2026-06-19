/**
 * もてなし広場 イベントナビ — 投稿フォーム自動生成スクリプト（Google Apps Script）
 *
 * 【使い方】
 * 1. https://script.google.com/ を開く →「新しいプロジェクト」
 * 2. このファイルの中身を全部コピペして貼り付け
 * 3. 上部の関数を「createEventForm」にして ▶ 実行
 * 4. 初回は権限の許可を求められる → 自分のGoogleアカウントで許可
 * 5. 実行後、「実行ログ」に
 *      - フォーム公開URL（←これをサイトの app.js に貼る）
 *      - フォーム編集URL
 *      - 回答スプレッドシートURL
 *    が出力されます。
 *
 * ※ ファイル添付（チラシPDF/画像）は、投稿者にGoogleログインを求めます。
 *    ログイン無しでも出せるよう「チラシのURL」欄も用意しています。
 */
function createEventForm() {
  var form = FormApp.create('もてなし広場 イベント情報の提供');
  form.setDescription(
    '高崎・もてなし広場のイベント情報をお寄せください。掲載は無料です。\n' +
    '内容を確認のうえ掲載します（事実確認のためご連絡する場合があります）。'
  );
  form.setCollectEmail(false);     // 投稿のハードルを下げる（メールは任意項目で取得）
  form.setLimitOneResponsePerUser(false);
  form.setAllowResponseEdits(false);

  // 1. イベント名（必須）
  form.addTextItem().setTitle('イベント名').setRequired(true);

  // 2. 開催日（初日・必須）
  form.addDateItem().setTitle('開催日（初日）').setRequired(true);

  // 3. 終了日（複数日のとき・任意）
  form.addDateItem()
    .setTitle('終了日（複数日にわたる場合のみ）')
    .setHelpText('1日だけの場合は空欄でOK')
    .setRequired(false);

  // 4. 開催時間
  form.addTextItem()
    .setTitle('開催時間')
    .setHelpText('例：10:00〜15:00')
    .setRequired(false);

  // 5. 会場（必須）
  form.addMultipleChoiceItem()
    .setTitle('会場')
    .setChoiceValues(['もてなし広場', '庁舎前広場', 'その他'])
    .showOtherOption(true)
    .setRequired(true);

  // 6. カテゴリ
  form.addMultipleChoiceItem()
    .setTitle('カテゴリ')
    .setChoiceValues(['マルシェ・市', 'グルメ', '祭り', '音楽', 'その他'])
    .showOtherOption(true)
    .setRequired(false);

  // 7. イベント内容・紹介
  form.addParagraphTextItem()
    .setTitle('イベント内容・紹介')
    .setHelpText('どんなイベントか、見どころなどを自由にご記入ください')
    .setRequired(false);

  // 8. 入場料
  form.addTextItem()
    .setTitle('入場料')
    .setHelpText('例：入場無料 / 大人500円 など')
    .setRequired(false);

  // 9. 公式サイト・SNSのURL
  form.addTextItem()
    .setTitle('公式サイト・SNSのURL')
    .setHelpText('イベントの詳細が分かるページがあれば')
    .setRequired(false);

  // 10. チラシ画像のURL（ログイン不要でも素材を送れる道）
  form.addTextItem()
    .setTitle('チラシ画像のURL（任意）')
    .setHelpText('Instagram投稿やチラシ画像のURLがあれば。ファイル添付（下）が難しい場合はこちらへ')
    .setRequired(false);

  // 11. チラシ・素材のファイル添付（PDF/画像・任意） ※添付にはGoogleログインが必要
  try {
    form.addFileUploadItem()
      .setTitle('チラシ・素材の添付（PDF・画像／任意）')
      .setHelpText('※ファイル添付にはGoogleログインが必要です。難しい場合は上の「チラシ画像のURL」やメールでもOK')
      .setRequired(false);
  } catch (e) {
    Logger.log('※ファイル添付項目は作成できませんでした（アカウント種別による制限の可能性）: ' + e);
  }

  // 12. 主催者・お問い合わせ先
  form.addTextItem()
    .setTitle('主催者・お問い合わせ先（任意）')
    .setRequired(false);

  // 13. ご提供者のお名前・連絡先
  form.addTextItem()
    .setTitle('ご提供者のお名前・ご連絡先（任意）')
    .setHelpText('掲載前に確認のご連絡をする場合があります')
    .setRequired(false);

  // 回答を集めるスプレッドシートを作成して連携
  var ss = SpreadsheetApp.create('もてなし広場 イベント投稿（回答）');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  // 結果を出力
  var publishedUrl = form.getPublishedUrl();
  var shortUrl = form.shortenFormUrl(publishedUrl);
  Logger.log('==============================================');
  Logger.log('▼ フォーム公開URL（←これをサイトの app.js に貼る）');
  Logger.log(shortUrl);
  Logger.log('');
  Logger.log('▼ フォーム編集URL（質問を直す時）');
  Logger.log(form.getEditUrl());
  Logger.log('');
  Logger.log('▼ 回答スプレッドシート');
  Logger.log(ss.getUrl());
  Logger.log('==============================================');
}
