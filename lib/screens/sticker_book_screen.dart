import 'package:flutter/material.dart';

import '../providers/sticker_store.dart';
import '../widgets/pastel_background.dart';
import '../widgets/sticker_card.dart';
import 'create_sticker_screen.dart';
import 'sticker_detail_screen.dart';

class StickerBookScreen extends StatelessWidget {
  const StickerBookScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final store = StickerStoreProvider.of(context);

    return AnimatedBuilder(
      animation: store,
      builder: (context, _) {
        return Scaffold(
          appBar: AppBar(title: const Text('シール帳')),
          floatingActionButton: FloatingActionButton.extended(
            backgroundColor: const Color(0xFFFF8DB7),
            foregroundColor: Colors.white,
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const CreateStickerScreen()),
            ),
            icon: const Icon(Icons.add),
            label: const Text('作る'),
          ),
          body: PastelBackground(
            child: store.stickers.isEmpty
                ? const _EmptyStickerBook()
                : GridView.builder(
                    padding: const EdgeInsets.fromLTRB(20, 20, 20, 100),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 18,
                      mainAxisSpacing: 22,
                      childAspectRatio: 0.78,
                    ),
                    itemCount: store.stickers.length,
                    itemBuilder: (context, index) {
                      final sticker = store.stickers[index];
                      return StickerCard(
                        sticker: sticker,
                        onTap: () => Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => StickerDetailScreen(sticker: sticker),
                          ),
                        ),
                      );
                    },
                  ),
          ),
        );
      },
    );
  }
}

class _EmptyStickerBook extends StatelessWidget {
  const _EmptyStickerBook();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.collections_bookmark_outlined, size: 64, color: Color(0xFFFF8DB7)),
            SizedBox(height: 16),
            Text(
              'まだシールがありません。\nお気に入りの写真から作ってみましょう。',
              textAlign: TextAlign.center,
              style: TextStyle(color: Color(0xFF9B7E98), fontWeight: FontWeight.w700),
            ),
          ],
        ),
      ),
    );
  }
}
