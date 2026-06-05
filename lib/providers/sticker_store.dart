import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../models/sticker.dart';
import '../repositories/sticker_repository.dart';

class StickerStore extends ChangeNotifier {
  StickerStore(this._repository);

  final StickerRepository _repository;
  List<Sticker> _stickers = [];

  List<Sticker> get stickers => List.unmodifiable(_stickers);
  int get count => _stickers.length;

  void loadStickers() {
    _stickers = _repository.getAll();
    notifyListeners();
  }

  Future<void> addSticker({required String name, required XFile image}) async {
    final sticker = await _repository.addSticker(name: name, pickedImage: image);
    _stickers = [sticker, ..._stickers];
    notifyListeners();
  }

  Sticker? findById(String id) {
    for (final sticker in _stickers) {
      if (sticker.id == id) {
        return sticker;
      }
    }
    return null;
  }

  Future<void> updateStickerName({
    required Sticker sticker,
    required String name,
  }) async {
    final updated = await _repository.updateStickerName(
      sticker: sticker,
      name: name,
    );
    _stickers = _stickers
        .map((item) => item.id == updated.id ? updated : item)
        .toList();
    notifyListeners();
  }

  Future<void> deleteSticker(Sticker sticker) async {
    await _repository.deleteSticker(sticker);
    _stickers = _stickers.where((item) => item.id != sticker.id).toList();
    notifyListeners();
  }
}

class StickerStoreProvider extends InheritedNotifier<StickerStore> {
  const StickerStoreProvider({
    super.key,
    required StickerStore store,
    required super.child,
  }) : super(notifier: store);

  static StickerStore of(BuildContext context) {
    final provider =
        context.dependOnInheritedWidgetOfExactType<StickerStoreProvider>();
    assert(provider != null, 'StickerStoreProvider was not found.');
    return provider!.notifier!;
  }
}
