import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/sticker.dart';
import '../providers/sticker_store.dart';
import '../widgets/pastel_background.dart';
import '../widgets/sticker_card.dart';

class StickerDetailScreen extends StatelessWidget {
  const StickerDetailScreen({super.key, required this.sticker});

  final Sticker sticker;

  Future<void> _editStickerName(BuildContext context, Sticker current) async {
    final controller = TextEditingController(text: current.name);
    final updatedName = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('シール名を編集'),
        content: TextField(
          controller: controller,
          autofocus: true,
          maxLength: 30,
          textInputAction: TextInputAction.done,
          decoration: const InputDecoration(
            labelText: 'シール名',
            hintText: 'お気に入りの名前を付けてね',
          ),
          onSubmitted: (_) => Navigator.of(context).pop(controller.text),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('キャンセル'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(controller.text),
            child: const Text('保存する'),
          ),
        ],
      ),
    );
    controller.dispose();

    if (updatedName == null || !context.mounted) return;
    try {
      await StickerStoreProvider.of(context).updateStickerName(
        sticker: current,
        name: updatedName,
      );
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('シール名を更新しました。')),
      );
    } on Exception {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('シール名を保存できませんでした。')),
      );
    }
  }

  Future<void> _deleteSticker(BuildContext context, Sticker current) async {
    final shouldDelete = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('削除しますか？'),
        content: Text('「${current.name}」をシール帳から削除します。'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('キャンセル'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('削除する'),
          ),
        ],
      ),
    );

    if (shouldDelete != true || !context.mounted) return;
    await StickerStoreProvider.of(context).deleteSticker(current);
    if (!context.mounted) return;
    Navigator.of(context).pop();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('シールを削除しました。')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final store = StickerStoreProvider.of(context);

    return AnimatedBuilder(
      animation: store,
      builder: (context, _) {
        final current = store.findById(sticker.id) ?? sticker;

        return Scaffold(
          appBar: AppBar(
            title: const Text('シール詳細'),
            actions: [
              IconButton(
                onPressed: () => _editStickerName(context, current),
                icon: const Icon(Icons.edit_outlined),
                tooltip: 'シール名を編集',
              ),
            ],
          ),
          body: PastelBackground(
            child: ListView(
              padding: const EdgeInsets.all(24),
              children: [
                AspectRatio(
                  aspectRatio: 1,
                  child: Hero(
                    tag: 'sticker-${current.id}',
                    child: StickerImageFrame(
                      imagePath: current.imagePath,
                      borderRadius: 40,
                      padding: 12,
                    ),
                  ),
                ),
                const SizedBox(height: 28),
                Text(
                  current.name,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Color(0xFF594157),
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  '作成日 ${DateFormat('yyyy/MM/dd HH:mm').format(current.createdAt)}',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Color(0xFF9B7E98),
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 18),
                Wrap(
                  alignment: WrapAlignment.center,
                  spacing: 10,
                  children: [
                    Chip(label: Text('交換回数 ${current.tradeCount}')),
                    Chip(label: Text('レア度 ${'★' * current.rarity}')),
                  ],
                ),
                const SizedBox(height: 28),
                ElevatedButton.icon(
                  onPressed: () => _editStickerName(context, current),
                  icon: const Icon(Icons.drive_file_rename_outline),
                  label: const Text('シール名を編集'),
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: () => _deleteSticker(context, current),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFFDD4A68),
                    side: const BorderSide(color: Color(0xFFFF9EB4), width: 2),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(22),
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    backgroundColor: Colors.white.withOpacity(0.75),
                  ),
                  icon: const Icon(Icons.delete_outline),
                  label: const Text('削除する'),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
