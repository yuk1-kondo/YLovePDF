# Sticker Pocket

Flutterで作る「写真から自分だけのシールを作って、シール帳に保存する」MVPアプリです。  
今回はローカル完結を優先し、Firebase・ログイン・QR交換は実装していません。

## MVP機能

- ホーム画面
  - アプリ名「Sticker Pocket」
  - 所持シール数
  - 「シールを作る」ボタン
  - 「シール帳を見る」ボタン
- シール作成画面
  - 写真選択
  - 写真プレビュー
  - 白フチ・角丸・影付きのシール風カード表示
  - シール名入力
  - 保存
- シール帳画面
  - 保存済みシールのグリッド表示
  - シール画像・シール名・作成日表示
- シール詳細画面
  - シール画像の大きな表示
  - シール名・作成日
  - 削除
- ローカル保存
  - 画像ファイルをアプリ内ドキュメント領域へコピー保存
  - Hiveでシール一覧を永続化
  - アプリ再起動後もシール一覧を復元

## ローカル保存方針

このMVPは完全にローカル完結です。

- 写真は `image_picker` で端末から選択します。
- 選択した写真は `XFile.saveTo` でアプリ内ドキュメント領域の `sticker_images` ディレクトリへコピーします。
- シール情報はHiveの `stickers` boxに保存します。画像コピーまたはHive保存に失敗した場合は、中途半端な画像ファイルを残さないようにロールバックします。
- 保存されるメタデータは `id` / `name` / `imagePath` / `createdAt` / `tradeCount` / `rarity` です。
- Firebase、ログイン、QR交換、外部API送信はこのフェーズでは使いません。

## Tech Stack

- Flutter / Dart
- Hive / hive_flutter（端末内DB）
- image_picker
- path_provider
- uuid
- intl

## Project Structure

```text
lib/
  main.dart
  constants/
    local_storage.dart
  models/
    sticker.dart
  providers/
    sticker_store.dart
  repositories/
    sticker_repository.dart
  screens/
    home_screen.dart
    create_sticker_screen.dart
    sticker_book_screen.dart
    sticker_detail_screen.dart
  widgets/
    pastel_background.dart
    sticker_card.dart
```

## 実行方法

Flutter SDKをインストールした環境で以下を実行してください。

```bash
flutter pub get
flutter run
```

iOSの写真ライブラリ説明文は `ios/Runner/Info.plist` に追加済みです。Androidでは `image_picker` の現行実装に従い、基本的に追加権限なしでフォトピッカーを利用できます。

## 次に実装すべきタスク

1. 背景除去・被写体切り抜き機能の追加
2. シールの丸型/角丸/フレーム選択
3. 名前編集・お気に入り・タグ分類
4. QRコードを使ったシール交換機能
5. 交換履歴に合わせた `tradeCount` 更新
6. レア度 `rarity` をUIと生成ロジックに反映
7. バックアップ/エクスポート機能
