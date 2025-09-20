const User = require('../models/User');

// Đăng ký
exports.register = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: 'Username và password là bắt buộc' });

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ message: 'Username đã tồn tại' });

    const newUser = new User({ username, password }); // hash sẽ xử lý trong model
    await newUser.save();

    res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: 'Username và password là bắt buộc' });

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Sai username hoặc password' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Sai username hoặc password' });

    // Lưu session chính
    req.session.userId = user._id;

    // Tạo thêm cookie phụ "sid" chứa cùng session id
    res.cookie('sid', req.session.id, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 ngày
      sameSite: 'lax',
    });

    res.json({ message: 'Đăng nhập thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Logout
exports.logout = (req, res) => {
  if (!req.session.userId) {
    // vẫn xóa cookie phụ nếu tồn tại
    res.clearCookie('connect.sid', { path: '/' });
    res.clearCookie('sid', { path: '/' });
    return res.status(200).json({ message: 'Bạn chưa đăng nhập' });
  }

  req.session.destroy(err => {
    // xóa cả 2 cookie
    res.clearCookie('connect.sid', { path: '/' });
    res.clearCookie('sid', { path: '/' });

    if (err) return res.status(500).json({ message: 'Lỗi khi logout' });
    res.json({ message: 'Đã logout' });
  });
};


// Lấy thông tin user
exports.profile = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }

  try {
    const user = await User.findById(req.session.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User không tồn tại' });

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
