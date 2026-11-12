import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../../providers/category_provider.dart';
import '../../providers/product_provider.dart';
import '../../config/theme.dart';
import '../../models/product_model.dart';

class ProductFormScreen extends StatefulWidget {
  final ProductModel? product;

  const ProductFormScreen({super.key, this.product});

  @override
  State<ProductFormScreen> createState() => _ProductFormScreenState();
}

class _ProductFormScreenState extends State<ProductFormScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _priceController;
  late TextEditingController _stockController;
  late TextEditingController _descController;
  int? _selectedCategoryId;
  File? _selectedImageFile;
  final ImagePicker _picker = ImagePicker();

  bool get isEdit => widget.product != null;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.product?.name ?? '');
    _priceController = TextEditingController(
      text: widget.product != null ? widget.product!.price.toStringAsFixed(0) : '',
    );
    _stockController = TextEditingController(
      text: widget.product != null ? widget.product!.stock.toString() : '0',
    );
    _descController = TextEditingController(text: widget.product?.description ?? '');
    _selectedCategoryId = widget.product?.categoryId;

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final catProvider = Provider.of<CategoryProvider>(context, listen: false);
      if (catProvider.categories.isEmpty) {
        catProvider.fetchCategories();
      }
    });
  }

  @override
  void dispose() {
    _nameController.dispose();
    _priceController.dispose();
    _stockController.dispose();
    _descController.dispose();
    super.dispose();
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final pickedFile = await _picker.pickImage(
        source: source,
        maxWidth: 1024,
        maxHeight: 1024,
        imageQuality: 85,
      );

      if (pickedFile != null) {
        setState(() {
          _selectedImageFile = File(pickedFile.path);
        });
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Gagal memilih gambar: $e'),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }

  void _showImagePickerModal() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Pilih Sumber Foto Menu',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(height: 16),
              ListTile(
                leading: const CircleAvatar(
                  backgroundColor: AppTheme.primaryColor,
                  child: Icon(Icons.camera_alt, color: Colors.white),
                ),
                title: const Text('Ambil Foto Kamera'),
                onTap: () {
                  Navigator.pop(ctx);
                  _pickImage(ImageSource.camera);
                },
              ),
              ListTile(
                leading: const CircleAvatar(
                  backgroundColor: AppTheme.secondaryColor,
                  child: Icon(Icons.photo_library, color: Colors.white),
                ),
                title: const Text('Pilih dari Galeri Foto'),
                onTap: () {
                  Navigator.pop(ctx);
                  _pickImage(ImageSource.gallery);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;

    if (_selectedCategoryId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Silakan pilih kategori produk terlebih dahulu.'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    final provider = Provider.of<ProductProvider>(context, listen: false);
    final name = _nameController.text.trim();
    final price = double.tryParse(_priceController.text.trim()) ?? 0.0;
    final stock = int.tryParse(_stockController.text.trim()) ?? 0;
    final desc = _descController.text.trim();

    bool success;
    if (isEdit) {
      success = await provider.updateProduct(
        id: widget.product!.id,
        categoryId: _selectedCategoryId!,
        name: name,
        description: desc.isNotEmpty ? desc : null,
        price: price,
        stock: stock,
        imageFile: _selectedImageFile,
      );
    } else {
      success = await provider.addProduct(
        categoryId: _selectedCategoryId!,
        name: name,
        description: desc.isNotEmpty ? desc : null,
        price: price,
        stock: stock,
        imageFile: _selectedImageFile,
      );
    }

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(isEdit ? 'Menu berhasil diperbarui.' : 'Menu baru berhasil ditambahkan.'),
          backgroundColor: AppTheme.secondaryColor,
        ),
      );
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(provider.errorMessage ?? 'Gagal menyimpan menu.'),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final catProvider = context.watch<CategoryProvider>();
    final prodProvider = context.watch<ProductProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Text(isEdit ? 'Edit Menu Produk' : 'Tambah Menu Baru'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Bagian Upload & Preview Foto Menu
              GestureDetector(
                onTap: _showImagePickerModal,
                child: Container(
                  height: 180,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey.shade300, width: 1.5),
                  ),
                  child: _selectedImageFile != null
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Stack(
                            fit: StackFit.expand,
                            children: [
                              Image.file(_selectedImageFile!, fit: BoxFit.cover),
                              Positioned(
                                bottom: 8,
                                right: 8,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: Colors.black.withOpacity(0.7),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: const Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(Icons.edit, size: 14, color: Colors.white),
                                      SizedBox(width: 4),
                                      Text('Ubah Foto', style: TextStyle(color: Colors.white, fontSize: 11)),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        )
                      : (isEdit && widget.product?.imageFullUrl != null)
                          ? ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Stack(
                                fit: StackFit.expand,
                                children: [
                                  Image.network(widget.product!.imageFullUrl!, fit: BoxFit.cover),
                                  Positioned(
                                    bottom: 8,
                                    right: 8,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: Colors.black.withOpacity(0.7),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: const Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(Icons.edit, size: 14, color: Colors.white),
                                          SizedBox(width: 4),
                                          Text('Ganti Foto', style: TextStyle(color: Colors.white, fontSize: 11)),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            )
                          : Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: const [
                                Icon(Icons.add_a_photo_outlined, size: 48, color: AppTheme.primaryColor),
                                SizedBox(height: 8),
                                Text(
                                  'Unggah Foto Menu (JPG/PNG max 5MB)',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.primaryColor,
                                    fontSize: 13,
                                  ),
                                ),
                                SizedBox(height: 4),
                                Text(
                                  'Ketuk untuk mengambil foto atau dari galeri',
                                  style: TextStyle(fontSize: 11, color: AppTheme.textMuted),
                                ),
                              ],
                            ),
                ),
              ),
              const SizedBox(height: 20),

              // Pilihan Kategori
              DropdownButtonFormField<int>(
                value: _selectedCategoryId,
                decoration: const InputDecoration(
                  labelText: 'Pilih Kategori Menu *',
                  prefixIcon: Icon(Icons.category_outlined),
                ),
                hint: const Text('Pilih salah satu kategori'),
                items: catProvider.categories.map((cat) {
                  return DropdownMenuItem<int>(
                    value: cat.id,
                    child: Text(cat.name),
                  );
                }).toList(),
                onChanged: (val) {
                  setState(() {
                    _selectedCategoryId = val;
                  });
                },
                validator: (val) => val == null ? 'Kategori produk wajib dipilih' : null,
              ),
              const SizedBox(height: 16),

              // Nama Produk
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Nama Produk / Menu *',
                  hintText: 'Contoh: Nasi Goreng Spesial Berkah',
                  prefixIcon: Icon(Icons.restaurant_outlined),
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) return 'Nama produk wajib diisi';
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Harga & Stok (2 Kolom)
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _priceController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'Harga (Rp) *',
                        hintText: '25000',
                        prefixIcon: Icon(Icons.payments_outlined),
                      ),
                      validator: (val) {
                        if (val == null || val.trim().isEmpty) return 'Harga wajib diisi';
                        final num = double.tryParse(val.trim());
                        if (num == null || num < 0) return 'Harga tidak valid';
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _stockController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'Stok Barang *',
                        hintText: '10',
                        prefixIcon: Icon(Icons.inventory_2_outlined),
                      ),
                      validator: (val) {
                        if (val == null || val.trim().isEmpty) return 'Stok wajib diisi';
                        final num = int.tryParse(val.trim());
                        if (num == null || num < 0) return 'Stok minimal 0';
                        return null;
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Deskripsi
              TextFormField(
                controller: _descController,
                maxLines: 4,
                decoration: const InputDecoration(
                  labelText: 'Deskripsi Menu',
                  hintText: 'Penjelasan rincian rasa, porsi, dan bahan menu...',
                  prefixIcon: Icon(Icons.notes_outlined),
                  alignLabelWithHint: true,
                ),
              ),
              const SizedBox(height: 30),

              // Tombol Simpan
              ElevatedButton(
                onPressed: prodProvider.isLoading ? null : _handleSave,
                child: prodProvider.isLoading
                    ? const SizedBox(
                        height: 22,
                        width: 22,
                        child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white),
                      )
                    : Text(isEdit ? 'Simpan Perubahan Menu' : 'Simpan Menu Baru'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

