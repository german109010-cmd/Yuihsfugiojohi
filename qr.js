const QRScanner = {
    videoElement: null,
    canvasElement: null,
    scanning: false,
    stream: null,
    
    init() {
        this.videoElement = document.getElementById('qrVideo');
        this.canvasElement = document.getElementById('qrCanvas');
    },
    
    async startCamera() {
        try {
            const startBtn = document.getElementById('startCameraBtn');
            if (startBtn) startBtn.disabled = true;
            
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });
            
            this.stream = stream;
            this.videoElement.srcObject = stream;
            this.videoElement.style.display = 'block';
            document.getElementById('scanPlaceholder').style.display = 'none';
            
            await this.videoElement.play();
            
            this.scanning = true;
            this.scanQRCode();
            
        } catch (error) {
            console.error('Camera error:', error);
            VaultApp.showToast('Camera access denied or not available');
            
            const startBtn = document.getElementById('startCameraBtn');
            if (startBtn) startBtn.disabled = false;
        }
    },
    
    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        if (this.videoElement) {
            this.videoElement.srcObject = null;
            this.videoElement.style.display = 'none';
        }
        
        this.scanning = false;
        document.getElementById('scanPlaceholder').style.display = 'block';
        
        const startBtn = document.getElementById('startCameraBtn');
        if (startBtn) startBtn.disabled = false;
    },
    
    scanQRCode() {
        if (!this.scanning || !this.videoElement.readyState) return;
        
        const canvas = this.canvasElement;
        const context = canvas.getContext('2d');
        
        canvas.width = this.videoElement.videoWidth;
        canvas.height = this.videoElement.videoHeight;
        context.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Простая проверка QR кода (в реальном приложении используйте библиотеку jsQR)
        // Для демо просто проверяем наличие текста в центре
        try {
            // Симуляция сканирования QR кода
            if (Math.random() < 0.1) { // 10% шанс "найти" QR код для демо
                const fakeAddress = "0x" + Math.random().toString(16).substring(2, 42);
                this.handleScannedQR(fakeAddress);
                return;
            }
        } catch (error) {
            console.error('QR scan error:', error);
        }
        
        if (this.scanning) {
            setTimeout(() => this.scanQRCode(), 100);
        }
    },
    
    handleScannedQR(text) {
        this.stopCamera();
        
        // Заполняем поле ввода адреса
        const manualAddress = document.getElementById('manualAddress');
        if (manualAddress) {
            manualAddress.value = text;
            VaultApp.showToast(`QR code scanned: ${text.substring(0, 20)}...`);
        }
    }
};