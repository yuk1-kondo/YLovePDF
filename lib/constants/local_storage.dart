class LocalStorageKeys {
  const LocalStorageKeys._();

  static const stickersBoxName = 'stickers';
  static const stickerImagesDirectoryName = 'sticker_images';
}

class LocalStorageCopy {
  const LocalStorageCopy._();

  static const localOnlyTitle = 'この端末だけに保存';
  static const localOnlyDescription =
      '写真とシール情報はアプリ内にローカル保存されます。Firebase・ログイン・外部送信はまだ使いません。';
}
