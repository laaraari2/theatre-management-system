import React, { useState, useEffect, useRef } from 'react';
import './InteractiveCharts.css';

interface ChartData {
  label: string;
  value: number;
  color: string;
  icon?: string;
}

interface TimeSeriesData {
  date: string;
  value: number;
  category: string;
}

interface InteractiveChartsProps {
  onClose: () => void;
  data: {
    activities: ChartData[];
    participants: ChartData[];
    timeline: TimeSeriesData[];
    categories: ChartData[];
  };
}

const InteractiveCharts: React.FC<InteractiveChartsProps> = ({
  onClose,
  data
}) => {
  const [activeChart, setActiveChart] = useState<'pie' | 'bar' | 'line' | 'donut'>('pie');
  const [selectedData, setSelectedData] = useState<ChartData | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // بدء الأنيميشن
  useEffect(() => {
    const startTime = Date.now();
    const duration = 1500;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // تأثير easing
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setAnimationProgress(easedProgress);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [activeChart]);

  // رسم الرسم البياني الدائري
  const drawPieChart = (ctx: CanvasRenderingContext2D, data: ChartData[], centerX: number, centerY: number, radius: number) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -Math.PI / 2;

    data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI * animationProgress;
      
      // رسم القطعة
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      
      // تأثير التمييز عند التمرير
      if (hoveredSegment === index) {
        ctx.fillStyle = lightenColor(item.color, 20);
        ctx.shadowColor = item.color;
        ctx.shadowBlur = 15;
      } else {
        ctx.fillStyle = item.color;
        ctx.shadowBlur = 0;
      }
      
      ctx.fill();

      // رسم النص
      if (sliceAngle > 0.1) {
        const textAngle = currentAngle + sliceAngle / 2;
        const textX = centerX + Math.cos(textAngle) * (radius * 0.7);
        const textY = centerY + Math.sin(textAngle) * (radius * 0.7);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 2;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        
        const percentage = ((item.value / total) * 100).toFixed(1);
        ctx.fillText(`${percentage}%`, textX, textY);
        
        if (item.icon) {
          ctx.font = '20px Arial';
          ctx.fillText(item.icon, textX, textY - 20);
        }
      }

      currentAngle += sliceAngle;
    });
  };

  // رسم الرسم البياني العمودي
  const drawBarChart = (ctx: CanvasRenderingContext2D, data: ChartData[], x: number, y: number, width: number, height: number) => {
    const maxValue = Math.max(...data.map(item => item.value));
    const barWidth = width / data.length * 0.8;
    const spacing = width / data.length * 0.2;

    data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * height * animationProgress;
      const barX = x + index * (barWidth + spacing) + spacing / 2;
      const barY = y + height - barHeight;

      // رسم العمود
      ctx.fillStyle = hoveredSegment === index ? lightenColor(item.color, 20) : item.color;
      ctx.fillRect(barX, barY, barWidth, barHeight);

      // تأثير التدرج
      const gradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight);
      gradient.addColorStop(0, lightenColor(item.color, 30));
      gradient.addColorStop(1, item.color);
      ctx.fillStyle = gradient;
      ctx.fillRect(barX, barY, barWidth, barHeight);

      // رسم القيمة
      ctx.fillStyle = '#333';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.value.toString(), barX + barWidth / 2, barY - 5);

      // رسم التسمية
      ctx.fillStyle = '#666';
      ctx.font = '11px Arial';
      ctx.save();
      ctx.translate(barX + barWidth / 2, y + height + 15);
      ctx.rotate(-Math.PI / 4);
      ctx.fillText(item.label, 0, 0);
      ctx.restore();

      // رسم الأيقونة
      if (item.icon) {
        ctx.font = '16px Arial';
        ctx.fillText(item.icon, barX + barWidth / 2, barY - 25);
      }
    });
  };

  // رسم الرسم البياني الخطي
  const drawLineChart = (ctx: CanvasRenderingContext2D, timeData: TimeSeriesData[], x: number, y: number, width: number, height: number) => {
    if (timeData.length === 0) return;

    const maxValue = Math.max(...timeData.map(item => item.value));
    const minValue = Math.min(...timeData.map(item => item.value));
    const valueRange = maxValue - minValue || 1;

    // رسم الشبكة
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const gridY = y + (height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(x, gridY);
      ctx.lineTo(x + width, gridY);
      ctx.stroke();
    }

    // رسم الخط
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 3;
    ctx.beginPath();

    timeData.forEach((point, index) => {
      const pointX = x + (index / (timeData.length - 1)) * width;
      const pointY = y + height - ((point.value - minValue) / valueRange) * height;

      if (index === 0) {
        ctx.moveTo(pointX, pointY);
      } else {
        // تأثير الأنيميشن
        const progress = Math.min((animationProgress * timeData.length - index) / 1, 1);
        if (progress > 0) {
          ctx.lineTo(pointX, pointY);
        }
      }
    });

    ctx.stroke();

    // رسم النقاط
    timeData.forEach((point, index) => {
      const pointX = x + (index / (timeData.length - 1)) * width;
      const pointY = y + height - ((point.value - minValue) / valueRange) * height;
      
      const progress = Math.min((animationProgress * timeData.length - index) / 1, 1);
      if (progress > 0) {
        ctx.fillStyle = '#2196F3';
        ctx.beginPath();
        ctx.arc(pointX, pointY, 4, 0, 2 * Math.PI);
        ctx.fill();

        // تأثير التمييز
        if (hoveredSegment === index) {
          ctx.fillStyle = 'rgba(33, 150, 243, 0.3)';
          ctx.beginPath();
          ctx.arc(pointX, pointY, 8, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    });
  };

  // رسم الرسم البياني الدائري المفرغ
  const drawDonutChart = (ctx: CanvasRenderingContext2D, data: ChartData[], centerX: number, centerY: number, outerRadius: number, innerRadius: number) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -Math.PI / 2;

    data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI * animationProgress;
      
      // رسم القطعة الخارجية
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, currentAngle, currentAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();
      
      ctx.fillStyle = hoveredSegment === index ? lightenColor(item.color, 20) : item.color;
      ctx.fill();

      currentAngle += sliceAngle;
    });

    // رسم النص في المركز
    ctx.fillStyle = '#333';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total.toString(), centerX, centerY - 10);
    
    ctx.font = '14px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('إجمالي الأنشطة', centerX, centerY + 15);
  };

  // تفتيح اللون
  const lightenColor = (color: string, percent: number) => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };

  // رسم الرسم البياني
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // تنظيف الكانفاس
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 3;

    switch (activeChart) {
      case 'pie':
        drawPieChart(ctx, data.activities, centerX, centerY, radius);
        break;
      case 'bar':
        drawBarChart(ctx, data.activities, 50, 50, canvas.width - 100, canvas.height - 100);
        break;
      case 'line':
        drawLineChart(ctx, data.timeline, 50, 50, canvas.width - 100, canvas.height - 100);
        break;
      case 'donut':
        drawDonutChart(ctx, data.activities, centerX, centerY, radius, radius * 0.6);
        break;
    }
  }, [activeChart, animationProgress, hoveredSegment, data]);

  // التعامل مع النقر على الكانفاس
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // تحديد القطعة المنقورة (مبسط)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const angle = Math.atan2(y - centerY, x - centerX) + Math.PI / 2;
    
    if (activeChart === 'pie' || activeChart === 'donut') {
      const total = data.activities.reduce((sum, item) => sum + item.value, 0);
      let currentAngle = 0;
      
      for (let i = 0; i < data.activities.length; i++) {
        const sliceAngle = (data.activities[i].value / total) * 2 * Math.PI;
        if (angle >= currentAngle && angle <= currentAngle + sliceAngle) {
          setSelectedData(data.activities[i]);
          break;
        }
        currentAngle += sliceAngle;
      }
    }
  };

  // التعامل مع التمرير على الكانفاس
  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;

    // تحديد القطعة المُمرر عليها
    if (activeChart === 'bar') {
      const barWidth = (canvas.width - 100) / data.activities.length * 0.8;
      const spacing = (canvas.width - 100) / data.activities.length * 0.2;
      
      for (let i = 0; i < data.activities.length; i++) {
        const barX = 50 + i * (barWidth + spacing) + spacing / 2;
        if (x >= barX && x <= barX + barWidth) {
          setHoveredSegment(i);
          return;
        }
      }
      setHoveredSegment(null);
    }
  };

  return (
    <div className="interactive-charts-overlay">
      <div className="charts-container">
        {/* Header */}
        <div className="charts-header">
          <h3>📊 الإحصائيات التفاعلية</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Chart Type Selector */}
        <div className="chart-selector">
          <button
            className={`chart-btn ${activeChart === 'pie' ? 'active' : ''}`}
            onClick={() => setActiveChart('pie')}
          >
            🥧 دائري
          </button>
          <button
            className={`chart-btn ${activeChart === 'donut' ? 'active' : ''}`}
            onClick={() => setActiveChart('donut')}
          >
            🍩 مفرغ
          </button>
          <button
            className={`chart-btn ${activeChart === 'bar' ? 'active' : ''}`}
            onClick={() => setActiveChart('bar')}
          >
            📊 عمودي
          </button>
          <button
            className={`chart-btn ${activeChart === 'line' ? 'active' : ''}`}
            onClick={() => setActiveChart('line')}
          >
            📈 خطي
          </button>
        </div>

        {/* Chart Canvas */}
        <div className="chart-area">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={() => setHoveredSegment(null)}
            className="chart-canvas"
          />
        </div>

        {/* Legend */}
        <div className="chart-legend">
          {data.activities.map((item, index) => (
            <div
              key={item.label}
              className={`legend-item ${hoveredSegment === index ? 'highlighted' : ''}`}
              onMouseEnter={() => setHoveredSegment(index)}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <div
                className="legend-color"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="legend-icon">{item.icon}</span>
              <span className="legend-label">{item.label}</span>
              <span className="legend-value">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Selected Data Details */}
        {selectedData && (
          <div className="selected-data-panel">
            <h4>📋 تفاصيل البيانات</h4>
            <div className="data-details">
              <div className="detail-item">
                <span className="detail-icon">{selectedData.icon}</span>
                <span className="detail-label">{selectedData.label}</span>
              </div>
              <div className="detail-value">
                <span className="value-number">{selectedData.value}</span>
                <span className="value-unit">نشاط</span>
              </div>
              <div className="detail-percentage">
                {((selectedData.value / data.activities.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
                من إجمالي الأنشطة
              </div>
            </div>
            <button
              className="close-details"
              onClick={() => setSelectedData(null)}
            >
              ✕
            </button>
          </div>
        )}

        {/* Statistics Summary */}
        <div className="stats-summary">
          <div className="stat-card">
            <div className="stat-icon">🎭</div>
            <div className="stat-value">{data.activities.reduce((sum, item) => sum + item.value, 0)}</div>
            <div className="stat-label">إجمالي الأنشطة</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{data.participants.reduce((sum, item) => sum + item.value, 0)}</div>
            <div className="stat-label">إجمالي المشاركين</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-value">{data.timeline.length}</div>
            <div className="stat-label">الفترات الزمنية</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-value">
              {data.activities.length > 0 ? Math.max(...data.activities.map(item => item.value)) : 0}
            </div>
            <div className="stat-label">أعلى نشاط</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveCharts;
