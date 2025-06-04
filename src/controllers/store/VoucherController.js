const VoucherService = require('../../services/store/Voucher.service');

class VoucherController {
    async createVoucher(req, res) {
        try {
            const voucher = await VoucherService.createVoucher(req.account.userId, req.body);
            res.status(201).json(voucher);
        } catch (error) {
            res.status(500).json({ message: "Error creating voucher", error });
        }
    }

    async getVouchersByStoreId(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const vouchers = await VoucherService.getVouchersByStoreId(req.account.userId, parseInt(page), parseInt(limit));
            res.status(200).json(vouchers);
        } catch (error) {
            res.status(500).json({ message: "Error fetching vouchers by store", error });
        }
    }
    async getVouchersByStoreIdDetail(req, res) {
        try {
            const { id } = req.params;
            const voucher = await VoucherService.getVoucherById(id);
            if (!voucher) {
                return res.status(404).json({ message: "Voucher not found" });
            }
            res.status(200).json(voucher);
        } catch (error) {
            res.status(500).json({ message: "Error fetching voucher by ID", error });
        }
    }
    async deleteVoucherById(req, res) {
        try {
            const { id } = req.params;
            const voucher = await VoucherService.deleteVoucherById(id);
            if (!voucher) {
                return res.status(404).json({ message: "Voucher not found" });
            }
            res.status(200).json({ message: "Voucher deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting voucher", error });
        }
    }
    async updateVoucher(req, res) {
        try {
            const { id } = req.params;
            const updatedVoucher = await VoucherService.updateVoucher(id, req.body);
            if (!updatedVoucher) {
                return res.status(404).json({ message: "Voucher not found" });
            }
            res.status(200).json(updatedVoucher);
        } catch (error) {
            res.status(500).json({ message: "Error updating voucher", error });
        }
    }
}

module.exports = new VoucherController();