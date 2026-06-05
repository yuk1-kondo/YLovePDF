import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../providers/sticker_store.dart';
import '../widgets/pastel_background.dart';
import '../widgets/sticker_card.dart';

class CreateStickerScreen extends StatefulWidget {
  const CreateStickerScreen({super.key});

  @override
  State<CreateStickerScreen> createState() => _CreateStickerScreenState();
}

class _CreateStickerScreenState extends State<CreateStickerScreen> {
  final _nameController = TextEditingController();
  final _picker = ImagePicker();
  XFile? _pickedImage;
  bool _isSaving = false;

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    try {
      final image = await _picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 92,
        maxWidth: 1800,
      );
      if (image != null) {
        setState(() => _pickedImage = image);
      }
    } on Exception {
      if (!mounted) return;
      _showMessage('写真を選択できませんでした。端末の写真権限を確認してください。');
    }
  }

  Future<void> _saveSticker() async {
    final image = _pickedImage;
    if (image == null || _isSaving) {
      _showMessage('先に写真を選んでください。');
      return;
    }

    setState(() => _isSaving = true);
    try {
      await StickerStoreProvider.of(context).addSticker(
        name: _nameController.text,
        image: image,
      );
      if (!mounted) return;
      _showMessage('シール帳に保存しました。');
      Navigator.of(context).pop();
    } on Exception {
      if (!mounted) return;
      _showMessage('ローカル保存に失敗しました。空き容量を確認してもう一度お試しください。');
    } finally {
      if (mounted) {
        setState(() => _isSaving = false);
      }
    }
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('シールを作る')),
      body: PastelBackground(
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            AspectRatio(
              aspectRatio: 1,
              child: _pickedImage == null
                  ? _EmptyPicker(onPickImage: _pickImage)
                  : StickerImageFrame(imagePath: _pickedImage!.path),
            ),
            const SizedBox(height: 24),
            OutlinedButton.icon(
              onPressed: _pickImage,
              icon: const Icon(Icons.photo_library_outlined),
              label: Text(_pickedImage == null ? '写真を選択する' : '写真を選び直す'),
            ),
            const SizedBox(height: 18),
            TextField(
              controller: _nameController,
              textInputAction: TextInputAction.done,
              decoration: const InputDecoration(
                labelText: 'シール名',
                hintText: '例：カフェで見つけたお花',
                prefixIcon: Icon(Icons.favorite_border),
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: _isSaving ? null : _saveSticker,
              icon: _isSaving
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.bookmark_add_outlined),
              label: const Text('保存する'),
            ),
          ],
        ),
      ),
    );
  }
}

class _EmptyPicker extends StatelessWidget {
  const _EmptyPicker({required this.onPickImage});

  final VoidCallback onPickImage;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(32),
      onTap: onPickImage,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.78),
          borderRadius: BorderRadius.circular(32),
          border: Border.all(color: const Color(0xFFFFCFE0), width: 2),
        ),
        child: const Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.add_photo_alternate_outlined, size: 58, color: Color(0xFFFF8DB7)),
            SizedBox(height: 12),
            Text(
              '写真を選んで\nシール風にプレビュー',
              textAlign: TextAlign.center,
              style: TextStyle(color: Color(0xFF9B7E98), fontWeight: FontWeight.w700),
            ),
          ],
        ),
      ),
    );
  }
}
