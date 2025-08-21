import React, { useState, useEffect } from 'react';
import { ArchiveService } from '../services/ArchiveService';
import type { SeasonArchive } from '../types';
import '../pages.css';

interface ArchivedSeason {
  id: string;
  year: string;
  title: string;
  description: string;
  activities?: ArchivedActivity[];
  reports?: any[];
  specialReports?: any[];
  createdAt: string;
  totalActivities?: number;
  totalParticipants?: number;
  totalReports?: number;
  archivedBy?: string;
}

interface ArchivedActivity {
  id: string;
  name: string;
  date: string;
  type: 'مسرحية' | 'ورشة' | 'مهرجان' | 'عرض' | 'تدريب';
  participants: number;
  description: string;
  images?: string[];
  achievements?: string[];
}

const Archive: React.FC = () => {
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [archives, setArchives] = useState<SeasonArchive[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadArchives();
  }, []);

  const loadArchives = () => {
    const allArchives = ArchiveService.getAllArchives();
    setArchives(allArchives);
  };

  const handleDownloadPDF = async (archive: SeasonArchive) => {
    setLoading(true);
    try {
      const pdfBlob = await ArchiveService.generateSeasonPDF(archive);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${archive.seasonName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('خطأ في إنشاء PDF:', error);
      alert('حدث خطأ في إنشاء ملف PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArchive = () => {
    // جلب البيانات الحالية من localStorage
    const currentActivities = JSON.parse(localStorage.getItem('theatre-activities') || '[]');
    const currentReports = JSON.parse(localStorage.getItem('reports') || '[]');

    const seasonName = `الموسم المسرحي ${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

    const newArchive = ArchiveService.createSeasonArchive(
      seasonName,
      currentActivities,
      currentReports
    );

    ArchiveService.saveArchive(newArchive);
    loadArchives();

    alert('تم إنشاء أرشيف الموسم بنجاح!');
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('الكل');
  const [archivedSeasons, setArchivedSeasons] = useState<ArchivedSeason[]>([]);

  // تحميل البيانات المؤرشفة من localStorage
  React.useEffect(() => {
    const savedArchive = localStorage.getItem('theatre-archive');
    if (savedArchive) {
      setArchivedSeasons(JSON.parse(savedArchive));
    } else {
      // بيانات تجريبية إذا لم يكن هناك أرشيف
      setArchivedSeasons([
    {
      id: '1',
      year: '2023-2024',
      title: 'الموسم المسرحي 2023-2024',
      description: 'موسم حافل بالأنشطة المسرحية والعروض المتميزة',
      totalActivities: 25,
      totalParticipants: 450,
      createdAt: '2024-06-30',
      activities: [
        {
          id: '1',
          name: 'مسرحية الأحلام الذهبية',
          date: '15 مارس 2024',
          type: 'مسرحية',
          participants: 35,
          description: 'مسرحية تعليمية حول أهمية التعليم والطموح',
          achievements: ['المركز الأول في المهرجان الإقليمي', 'جائزة أفضل إخراج']
        },
        {
          id: '2',
          name: 'ورشة الإلقاء والخطابة',
          date: '10 فبراير 2024',
          type: 'ورشة',
          participants: 20,
          description: 'ورشة تدريبية لتطوير مهارات الإلقاء والخطابة'
        },
        {
          id: '3',
          name: 'مهرجان المسرح المدرسي',
          date: '25 أبريل 2024',
          type: 'مهرجان',
          participants: 120,
          description: 'مهرجان سنوي يضم عروض من مختلف المدارس',
          achievements: ['تنظيم ناجح', 'مشاركة 8 مدارس']
        }
      ]
    },
    {
      id: '2',
      year: '2022-2023',
      title: 'الموسم المسرحي 2022-2023',
      description: 'موسم التجديد والإبداع في الأنشطة المسرحية',
      totalActivities: 18,
      totalParticipants: 320,
      createdAt: '2023-06-30',
      activities: [
        {
          id: '4',
          name: 'مسرحية حكايات من التراث',
          date: '20 مارس 2023',
          type: 'مسرحية',
          participants: 28,
          description: 'مسرحية تراثية تحكي قصص من الفولكلور المغربي'
        },
        {
          id: '5',
          name: 'عرض نهاية السنة',
          date: '15 يونيو 2023',
          type: 'عرض',
          participants: 45,
          description: 'عرض ختامي يضم أفضل المواهب المسرحية'
        }
      ]
    }
      ]);
    }
  }, []);

  const filteredSeasons = archivedSeasons.filter(season =>
    season.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    season.year.includes(searchTerm)
  );

  const getSelectedSeasonData = () => {
    return archivedSeasons.find(season => season.id === selectedSeason);
  };

  const getFilteredActivities = () => {
    const season = getSelectedSeasonData();
    if (!season || !season.activities) return [];

    return season.activities.filter(activity => {
      const matchesType = filterType === 'الكل' || activity.type === filterType;
      return matchesType;
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'مسرحية': return '#dc2626';
      case 'ورشة': return '#059669';
      case 'مهرجان': return '#7c3aed';
      case 'عرض': return '#ea580c';
      case 'تدريب': return '#0284c7';
      default: return '#6b7280';
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="container">
          <h1>📚 أرشيف الأنشطة المسرحية</h1>
          <p>أرشيف شامل لجميع الأنشطة والعروض المسرحية للمواسم السابقة</p>

          <div className="archive-controls">
            <button
              className="create-archive-btn"
              onClick={handleCreateArchive}
              disabled={loading}
            >
              📦 أرشفة الموسم الحالي
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        {!selectedSeason ? (
          // عرض قائمة المواسم
          <>
            <div className="search-filter">
              <input
                type="text"
                placeholder="🔍 البحث في الأرشيف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{archivedSeasons.length}</div>
                <div className="stat-label">مواسم مؤرشفة</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{archivedSeasons.reduce((sum, season) => sum + (season.totalActivities || season.totalReports || 0), 0)}</div>
                <div className="stat-label">نشاط/تقرير إجمالي</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{archivedSeasons.reduce((sum, season) => sum + (season.totalParticipants || 0), 0)}</div>
                <div className="stat-label">مشارك إجمالي</div>
              </div>
            </div>

            {/* الأرشيفات الجديدة */}
            {archives.length > 0 && (
              <div className="modern-archives-section">
                <h2>📦 أرشيف المواسم (النظام الجديد)</h2>
                <div className="archives-grid">
                  {archives.map((archive) => (
                    <div key={archive.id} className="archive-card modern">
                      <div className="archive-header">
                        <h3>{archive.seasonName}</h3>
                        <span className="archive-period">
                          {new Date(archive.startDate).getFullYear()} - {new Date(archive.endDate).getFullYear()}
                        </span>
                      </div>

                      <div className="archive-stats">
                        <div className="stat-item">
                          <span className="stat-number">{archive.statistics.totalActivities}</span>
                          <span className="stat-label">نشاط</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-number">{archive.statistics.completedActivities}</span>
                          <span className="stat-label">مكتمل</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-number">{archive.statistics.totalReports}</span>
                          <span className="stat-label">تقرير</span>
                        </div>
                      </div>

                      <div className="archive-actions">
                        <button
                          className="download-pdf-btn"
                          onClick={() => handleDownloadPDF(archive)}
                          disabled={loading}
                        >
                          {loading ? '⏳ جاري الإنشاء...' : '📄 تحميل PDF شامل'}
                        </button>
                      </div>

                      <div className="archive-footer">
                        <span className="archive-date">
                          أُرشف في: {new Date(archive.createdAt).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="seasons-grid">
              {filteredSeasons.map(season => (
                <div key={season.id} className="season-card" onClick={() => setSelectedSeason(season.id)}>
                  <div className="season-header">
                    <h3>{season.title}</h3>
                    <span className="season-year">{season.year}</span>
                  </div>
                  <p className="season-description">{season.description}</p>
                  <div className="season-stats">
                    <div className="stat-item">
                      <span className="stat-number">{season.totalActivities || season.totalReports || 0}</span>
                      <span className="stat-label">{season.totalReports ? 'تقرير' : 'نشاط'}</span>
                    </div>
                    {season.totalParticipants && (
                      <div className="stat-item">
                        <span className="stat-number">{season.totalParticipants}</span>
                        <span className="stat-label">مشارك</span>
                      </div>
                    )}
                  </div>
                  <div className="season-footer">
                    <span className="archive-date">أُرشف في: {season.createdAt}</span>
                    <button className="view-btn">عرض التفاصيل</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          // عرض تفاصيل الموسم المحدد
          <>
            <div className="season-details-header">
              <button 
                onClick={() => setSelectedSeason(null)}
                className="back-btn"
              >
                ← العودة للأرشيف
              </button>
              <div className="season-info">
                <h2>{getSelectedSeasonData()?.title}</h2>
                <p>{getSelectedSeasonData()?.description}</p>
              </div>
            </div>

            <div className="activities-filter">
              <div className="filter-buttons">
                {['الكل', 'مسرحية', 'ورشة', 'مهرجان', 'عرض', 'تدريب'].map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`filter-btn ${filterType === type ? 'active' : ''}`}
                    style={{
                      backgroundColor: filterType === type ? getTypeColor(type) : 'transparent',
                      borderColor: getTypeColor(type),
                      color: filterType === type ? 'white' : getTypeColor(type)
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* عرض الأنشطة إذا كانت موجودة */}
            {getSelectedSeasonData()?.activities && (
              <div className="activities-grid">
                {getFilteredActivities().map(activity => (
                  <div key={activity.id} className="activity-card">
                    <div className="activity-header">
                      <h4>{activity.name}</h4>
                      <span
                        className="activity-type"
                        style={{ backgroundColor: getTypeColor(activity.type) }}
                      >
                        {activity.type}
                      </span>
                    </div>
                    <div className="activity-details">
                      <p><strong>التاريخ:</strong> {activity.date}</p>
                      <p><strong>المشاركون:</strong> {activity.participants} طالب</p>
                      <p><strong>الوصف:</strong> {activity.description}</p>
                      {activity.achievements && (
                        <div className="achievements">
                          <strong>الإنجازات:</strong>
                          <ul>
                            {activity.achievements.map((achievement, index) => (
                              <li key={index}>{achievement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* عرض التقارير إذا كانت موجودة */}
            {getSelectedSeasonData()?.reports && (
              <div className="reports-grid">
                <h3>📊 التقارير الشهرية</h3>
                {getSelectedSeasonData()?.reports?.map((report: any) => (
                  <div key={report.id} className="report-card">
                    <div className="report-header">
                      <h4>{report.title}</h4>
                      <span className="report-date">{report.date}</span>
                    </div>
                    <div className="report-content">
                      <p className="report-summary">{report.summary}</p>
                      {report.activities && report.activities.length > 0 && (
                        <div className="report-activities">
                          <strong>الأنشطة:</strong>
                          <ul>
                            {report.activities.map((activity: string, index: number) => (
                              <li key={index}>{activity}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {report.achievements && report.achievements.length > 0 && (
                        <div className="report-achievements">
                          <strong>الإنجازات:</strong>
                          <ul>
                            {report.achievements.map((achievement: string, index: number) => (
                              <li key={index}>{achievement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {report.gallery && report.gallery.length > 0 && (
                        <div className="report-gallery">
                          <strong>معرض الصور:</strong>
                          <div className="gallery-preview">
                            {report.gallery.slice(0, 3).map((image: string, index: number) => (
                              <img key={index} src={image} alt={`صورة ${index + 1}`} />
                            ))}
                            {report.gallery.length > 3 && (
                              <span className="more-images">+{report.gallery.length - 3} صور أخرى</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* عرض التقارير الخاصة إذا كانت موجودة */}
            {getSelectedSeasonData()?.specialReports && (
              <div className="special-reports-grid">
                <h3>⭐ التقارير الخاصة</h3>
                {getSelectedSeasonData()?.specialReports?.map((report: any) => (
                  <div key={report.id} className="special-report-card">
                    <div className="special-report-header">
                      <div className="report-type-badge" data-type={report.type}>
                        {report.type === 'urgent' && '🚨 عاجل'}
                        {report.type === 'special' && '⭐ خاص'}
                        {report.type === 'summary' && '📊 موجز'}
                        {report.type === 'achievement' && '🏆 إنجاز'}
                      </div>
                      <div className="priority-badge" data-priority={report.priority}>
                        {report.priority === 'high' && '🔴 عالية'}
                        {report.priority === 'medium' && '🟡 متوسطة'}
                        {report.priority === 'low' && '🟢 منخفضة'}
                      </div>
                    </div>
                    <h4>{report.title}</h4>
                    <div className="report-meta">
                      <span className="report-date">📅 {report.date}</span>
                      <span className="report-author">👤 {report.createdBy}</span>
                    </div>
                    <div className="report-content">
                      <p>{report.content}</p>
                    </div>
                    {report.tags && report.tags.length > 0 && (
                      <div className="report-tags">
                        {report.tags.map((tag: string, index: number) => (
                          <span key={index} className="tag">🏷️ {tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Archive;
