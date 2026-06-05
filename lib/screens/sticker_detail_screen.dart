import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/sticker.dart';
import '../providers/sticker_store.dart';
import '../widgets/pastel_background.dart';
import '../widgets/sticker_card.dart';

class StickerDetailScreen extends StatelessWidget {
  const StickerDetailScreen({super.key, required this.sticker});

  final Sticker sticker;

  Future<void> _deleteSticker(BuildContext context) async {
    final shouldDelete = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('削除しますか？'),
        content: Text('「${sticker.name}」をシール帳から削除します。'),
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
    await StickerStoreProvider.of(context).deleteSticker(sticker);
    if (!context.mounted) return;
    Navigator.of(context).pop();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('シールを削除しました。')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('シール詳細')),
      body: PastelBackground(
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            AspectRatio(
              aspectRatio: 1,
              child: Hero(
                tag: 'sticker-${sticker.id}',
                child: StickerImageFrame(
                  imagePath: sticker.imagePath,
                  borderRadius: 40,
                  padding: 12,
                ),
              ),
            ),
            const SizedBox(height: 28),
            Text(
              sticker.name,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: Color(0xFF594157),
                fontSize: 28,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              '作成日 ${DateFormat('yyyy/MM/dd HH:mm').format(sticker.createdAt)}',
              textAlign: TextAlign.center,
              style: const TextStyle(color: Color(0xFF9B7E98), fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 18),
            Wrap(
              alignment: WrapAlignment.center,
              spacing: 10,
              children: [
                Chip(label: Text('交換回数 ${sticker.tradeCount}')),
                Chip(label: Text('レア度 ${'★' * sticker.rarity}')),
              ],
            ),
            const SizedBox(height: 28),
            OutlinedButton.icon(
              onPressed: () => _deleteSticker(context),
              style: OutlinedButton.styleFrom(
                foregroundColor: const Color(0xFFDD4A68),
                side: const BorderSide(color: Color(0xFFFF9EB4), width: 2),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
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
  }
}
