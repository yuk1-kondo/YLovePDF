import 'dart:io';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/sticker.dart';

class StickerCard extends StatelessWidget {
  const StickerCard({
    super.key,
    required this.sticker,
    this.showDate = true,
    this.onTap,
  });

  final Sticker sticker;
  final bool showDate;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(28),
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Expanded(
            child: Hero(
              tag: 'sticker-${sticker.id}',
              child: StickerImageFrame(imagePath: sticker.imagePath),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            sticker.name,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: Color(0xFF594157),
              fontWeight: FontWeight.w800,
            ),
          ),
          if (showDate) ...[
            const SizedBox(height: 2),
            Text(
              DateFormat('yyyy/MM/dd').format(sticker.createdAt),
              textAlign: TextAlign.center,
              style: const TextStyle(color: Color(0xFF9B7E98), fontSize: 12),
            ),
          ],
        ],
      ),
    );
  }
}

class StickerImageFrame extends StatelessWidget {
  const StickerImageFrame({
    super.key,
    required this.imagePath,
    this.borderRadius = 32,
    this.padding = 10,
  });

  final String imagePath;
  final double borderRadius;
  final double padding;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(padding),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(borderRadius),
        boxShadow: [
          BoxShadow(
            color: Colors.pink.withOpacity(0.18),
            blurRadius: 18,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(borderRadius - 10),
        child: Image.file(
          File(imagePath),
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) => const ColoredBox(
            color: Color(0xFFFFE8F1),
            child: Center(child: Icon(Icons.broken_image_outlined)),
          ),
        ),
      ),
    );
  }
}
