import 'package:hive/hive.dart';

class Sticker {
  const Sticker({
    required this.id,
    required this.name,
    required this.imagePath,
    required this.createdAt,
    this.tradeCount = 0,
    this.rarity = 1,
  });

  final String id;
  final String name;
  final String imagePath;
  final DateTime createdAt;
  final int tradeCount;
  final int rarity;

  Sticker copyWith({
    String? id,
    String? name,
    String? imagePath,
    DateTime? createdAt,
    int? tradeCount,
    int? rarity,
  }) {
    return Sticker(
      id: id ?? this.id,
      name: name ?? this.name,
      imagePath: imagePath ?? this.imagePath,
      createdAt: createdAt ?? this.createdAt,
      tradeCount: tradeCount ?? this.tradeCount,
      rarity: rarity ?? this.rarity,
    );
  }
}

class StickerAdapter extends TypeAdapter<Sticker> {
  static const typeIdValue = 1;

  @override
  final int typeId = typeIdValue;

  @override
  Sticker read(BinaryReader reader) {
    final fieldCount = reader.readByte();
    final fields = <int, dynamic>{
      for (var i = 0; i < fieldCount; i++) reader.readByte(): reader.read(),
    };

    return Sticker(
      id: fields[0] as String,
      name: fields[1] as String,
      imagePath: fields[2] as String,
      createdAt: fields[3] as DateTime,
      tradeCount: fields[4] as int? ?? 0,
      rarity: fields[5] as int? ?? 1,
    );
  }

  @override
  void write(BinaryWriter writer, Sticker obj) {
    writer
      ..writeByte(6)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.name)
      ..writeByte(2)
      ..write(obj.imagePath)
      ..writeByte(3)
      ..write(obj.createdAt)
      ..writeByte(4)
      ..write(obj.tradeCount)
      ..writeByte(5)
      ..write(obj.rarity);
  }
}
