import 'package:flutter_test/flutter_test.dart';
import 'package:sticker_pocket/models/sticker.dart';

void main() {
  test('Sticker defaults future exchange fields', () {
    final sticker = Sticker(
      id: 'id-1',
      name: 'sample',
      imagePath: '/tmp/sample.jpg',
      createdAt: DateTime(2026, 6, 5),
    );

    expect(sticker.tradeCount, 0);
    expect(sticker.rarity, 1);
  });

  test('Sticker copyWith keeps local image fields and updates name only', () {
    final createdAt = DateTime(2026, 6, 5, 12);
    final sticker = Sticker(
      id: 'id-2',
      name: 'before',
      imagePath: '/tmp/local-sticker.png',
      createdAt: createdAt,
      tradeCount: 2,
      rarity: 3,
    );

    final updated = sticker.copyWith(name: 'after');

    expect(updated.id, 'id-2');
    expect(updated.name, 'after');
    expect(updated.imagePath, '/tmp/local-sticker.png');
    expect(updated.createdAt, createdAt);
    expect(updated.tradeCount, 2);
    expect(updated.rarity, 3);
  });
}
