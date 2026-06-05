import 'dart:io';

import 'package:hive/hive.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:uuid/uuid.dart';

import '../constants/local_storage.dart';
import '../models/sticker.dart';

class StickerRepository {
  StickerRepository._(this._box, this._stickersDirectory);

  static const _boxName = LocalStorageKeys.stickersBoxName;
  static const _fallbackImageExtension = '.jpg';
  static const _uuid = Uuid();

  final Box<Sticker> _box;
  final Directory _stickersDirectory;

  static Future<StickerRepository> create() async {
    final box = await Hive.openBox<Sticker>(_boxName);
    final documentsDirectory = await getApplicationDocumentsDirectory();
    final stickersDirectory = Directory(
      p.join(
        documentsDirectory.path,
        LocalStorageKeys.stickerImagesDirectoryName,
      ),
    );
    if (!stickersDirectory.existsSync()) {
      await stickersDirectory.create(recursive: true);
    }
    return StickerRepository._(box, stickersDirectory);
  }

  List<Sticker> getAll() {
    final stickers = _box.values.toList()
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return stickers;
  }

  Future<Sticker> addSticker({
    required String name,
    required XFile pickedImage,
  }) async {
    final id = _uuid.v4();
    final extension = _imageExtensionFor(pickedImage);
    final savedImage = File(p.join(_stickersDirectory.path, '$id$extension'));

    final sticker = Sticker(
      id: id,
      name: name.trim().isEmpty ? 'なまえのないシール' : name.trim(),
      imagePath: savedImage.path,
      createdAt: DateTime.now(),
      tradeCount: 0,
      rarity: 1,
    );

    try {
      await pickedImage.saveTo(savedImage.path);
      await _box.put(sticker.id, sticker);
      return sticker;
    } catch (_) {
      if (savedImage.existsSync()) {
        await savedImage.delete();
      }
      rethrow;
    }
  }

  Future<void> deleteSticker(Sticker sticker) async {
    final image = File(sticker.imagePath);
    if (image.existsSync()) {
      await image.delete();
    }
    await _box.delete(sticker.id);
  }

  String _imageExtensionFor(XFile pickedImage) {
    final sourceName = pickedImage.name.isEmpty
        ? pickedImage.path
        : pickedImage.name;
    final extension = p.extension(sourceName).toLowerCase();
    return extension.isEmpty ? _fallbackImageExtension : extension;
  }
}
