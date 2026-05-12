import { useEffect, useState } from 'react';
import { Card, Row, Col, Input, Select, Button, Pagination, Empty, Spin, Tag, Avatar } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTeacherStore } from '../../store/teacherStore';
import { SUBJECTS, GENDER_OPTIONS, UPLOAD_URL } from '../../utils/constants';

const TeacherList = () => {
  const navigate = useNavigate();
  const { teachers, pagination, loading, searchTeachers } = useTeacherStore();

  const [filters, setFilters] = useState({
    subject: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    gender: undefined,
    page: 1,
    limit: 12
  });

  useEffect(() => {
    handleSearch();
  }, [filters.page]);

  const handleSearch = () => {
    const params = {};
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        params[key] = filters[key];
      }
    });
    searchTeachers(params);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 134px)' }}>
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="选择科目"
              style={{ width: '100%' }}
              allowClear
              value={filters.subject}
              onChange={(value) => handleFilterChange('subject', value)}
            >
              {SUBJECTS.map(subject => (
                <Select.Option key={subject} value={subject}>{subject}</Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="最低价格"
              type="number"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="最高价格"
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="性别"
              style={{ width: '100%' }}
              allowClear
              value={filters.gender}
              onChange={(value) => handleFilterChange('gender', value)}
            >
              {GENDER_OPTIONS.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24}>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
              block
            >
              搜索
            </Button>
          </Col>
        </Row>
      </Card>

      <Spin spinning={loading}>
        {teachers.length === 0 ? (
          <Empty description="暂无教师信息" />
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {teachers.map(teacher => (
                <Col xs={24} sm={12} md={8} lg={6} key={teacher.id}>
                  <Card
                    hoverable
                    onClick={() => navigate(`/teachers/${teacher.userId}`)}
                    cover={
                      <div style={{ padding: '20px', textAlign: 'center', background: '#fafafa' }}>
                        <Avatar
                          size={80}
                          src={teacher.avatarUrl ? `${UPLOAD_URL}${teacher.avatarUrl}` : null}
                          icon={!teacher.avatarUrl && <UserOutlined />}
                        />
                      </div>
                    }
                  >
                    <Card.Meta
                      title={teacher.fullName}
                      description={
                        <div>
                          <div style={{ marginBottom: '8px' }}>
                            {teacher.subjects?.slice(0, 3).map(subject => (
                              <Tag key={subject} color="blue">{subject}</Tag>
                            ))}
                          </div>
                          {teacher.tags?.length > 0 && (
                            <div style={{ marginBottom: '6px' }}>
                              {teacher.tags.slice(0, 3).map((tag, i) => (
                                <Tag key={i} color="green">{tag}</Tag>
                              ))}
                            </div>
                          )}
                          <div style={{ fontSize: '16px', color: '#ff4d4f', fontWeight: 'bold' }}>
                            ¥{teacher.hourlyRate || '-'}/小时
                          </div>
                          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                            {teacher.teachingExperience}年经验 · {teacher.education || '未填写'}
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Pagination
                current={pagination.page}
                total={pagination.total}
                pageSize={pagination.limit}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </div>
          </>
        )}
      </Spin>
    </div>
  );
};

export default TeacherList;
