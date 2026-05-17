/**
 * 测试脚本：materialReviewAgent
 *
 * 用法：node server/src/scripts/testMaterialReviewAgent.js
 *
 * 测试用例：
 * 1. certificate 高分 - 包含证书相关关键词
 * 2. education 高分 - 包含学历相关关键词
 * 3. experience 高分 - 包含教学经历关键词
 * 4. empty text - 空文本需要人工复核
 * 5. fake text - 包含风险词应被拒绝
 */

const { reviewTeacherMaterial } = require('../agents/materialReviewAgent');

// 测试用例
const testCases = [
  {
    name: '证书材料 - 高分（包含证书、资格等关键词）',
    input: {
      materialType: 'certificate',
      title: '高中数学教师资格证',
      originalFilename: 'teacher_cert.jpg',
      mimeType: 'image/jpeg',
      extractedText: '教师资格证 高中数学 合格 认定 证书编号：2024001234 通过考试',
      teacherProfile: {
        subjects: ['数学', '物理'],
        fullName: '张老师',
        teachingExperience: 5
      }
    },
    expectedMinScore: 80,
    expectedStatus: 'approved'
  },
  {
    name: '学历材料 - 高分（包含大学、学位等关键词）',
    input: {
      materialType: 'education',
      title: '硕士学位证书',
      originalFilename: 'master_degree.pdf',
      mimeType: 'application/pdf',
      extractedText: '硕士学位证书 北京大学 计算机科学与技术专业 毕业 2020年 degree master',
      teacherProfile: {
        subjects: ['数学', '英语', '计算机'],
        fullName: '李老师',
        teachingExperience: 3
      }
    },
    expectedMinScore: 80,
    expectedStatus: 'approved'
  },
  {
    name: '教学经历 - 高分（包含教学、家教等关键词）',
    input: {
      materialType: 'experience',
      title: '三年家教经历证明',
      originalFilename: 'experience.txt',
      mimeType: 'text/plain',
      extractedText: '教学经历：曾在学而思担任数学教师，负责一对一辅导和小组授课，累计教学经验5年。擅长高中数学家教辅导。',
      teacherProfile: {
        subjects: ['数学'],
        fullName: '王老师',
        teachingExperience: 5
      }
    },
    expectedMinScore: 80,
    expectedStatus: 'approved'
  },
  {
    name: '空文本 - 需要人工复核',
    input: {
      materialType: 'certificate',
      title: '证书图片',
      originalFilename: 'cert.png',
      mimeType: 'image/png',
      extractedText: '',
      teacherProfile: {
        subjects: ['数学'],
        fullName: '赵老师',
        teachingExperience: 2
      }
    },
    expectedStatus: 'need_manual_review'
  },
  {
    name: '风险词 - 应被拒绝',
    input: {
      materialType: 'certificate',
      title: '证书',
      originalFilename: 'fake_cert.txt',
      mimeType: 'text/plain',
      extractedText: '伪造的教师资格证，假证代做，欺骗平台',
      teacherProfile: {
        subjects: ['数学'],
        fullName: '孙老师',
        teachingExperience: 1
      }
    },
    expectedStatus: 'rejected',
    expectedMaxScore: 30
  },
  {
    name: '个人介绍 - 正常',
    input: {
      materialType: 'self_intro',
      title: '个人简历',
      originalFilename: 'resume.pdf',
      mimeType: 'application/pdf',
      extractedText: '本人从事数学教学多年，教学风格耐心细致，注重系统性训练，善于因材施教。',
      teacherProfile: {
        subjects: ['数学'],
        fullName: '周老师',
        teachingExperience: 10
      }
    },
    expectedMinScore: 50
  },
  {
    name: '材料与科目关联 - 加分',
    input: {
      materialType: 'experience',
      title: '数学教学证明',
      originalFilename: 'math_exp.txt',
      mimeType: 'text/plain',
      extractedText: '长期从事高中数学教学工作，有丰富的数学家教经验',
      teacherProfile: {
        subjects: ['数学', '物理'],
        fullName: '吴老师',
        teachingExperience: 5
      }
    },
    expectedStatus: 'need_manual_review',
    expectedMinScore: 60
  },
  {
    name: '文本过短 - 需要人工复核',
    input: {
      materialType: 'certificate',
      title: '证书',
      originalFilename: 'short.txt',
      mimeType: 'text/plain',
      extractedText: '证书',
      teacherProfile: {
        subjects: ['英语'],
        fullName: '郑老师',
        teachingExperience: 2
      }
    },
    expectedStatus: 'need_manual_review'
  }
];

// 运行测试
console.log('='.repeat(80));
console.log('开始测试 materialReviewAgent');
console.log('='.repeat(80));

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. ${testCase.name}`);
  console.log('-'.repeat(60));

  try {
    const result = reviewTeacherMaterial(testCase.input);

    console.log(`审核状态: ${result.reviewStatus}`);
    console.log(`AI 评分: ${result.aiScore}`);
    console.log(`AI 摘要: ${result.aiSummary}`);
    console.log(`AI 标签: [${result.aiTags.join(', ')}]`);
    console.log(`AI 亮点: [${result.aiHighlights.join(', ')}]`);
    console.log(`风险标记: [${result.aiRiskFlags.join(', ')}]`);
    console.log(`审核建议: ${result.reviewSuggestion}`);

    // 验证
    let valid = true;
    const errors = [];

    if (testCase.expectedStatus) {
      if (result.reviewStatus !== testCase.expectedStatus) {
        errors.push(`状态期望 ${testCase.expectedStatus}，实际 ${result.reviewStatus}`);
        valid = false;
      }
    }

    if (testCase.expectedMinScore && result.aiScore < testCase.expectedMinScore) {
      errors.push(`评分期望 >= ${testCase.expectedMinScore}，实际 ${result.aiScore}`);
      valid = false;
    }

    if (testCase.expectedMaxScore && result.aiScore > testCase.expectedMaxScore) {
      errors.push(`评分期望 <= ${testCase.expectedMaxScore}，实际 ${result.aiScore}`);
      valid = false;
    }

    if (valid) {
      console.log('结果: ✅ 通过');
      passed++;
    } else {
      console.log('结果: ❌ 失败');
      errors.forEach(err => console.log(`  - ${err}`));
      failed++;
    }
  } catch (err) {
    console.log('结果: ❌ 异常');
    console.log(`错误: ${err.message}`);
    failed++;
  }
});

console.log('\n' + '='.repeat(80));
console.log(`测试完成: ${passed} 通过, ${failed} 失败`);
console.log('='.repeat(80));

// 输出一个示例请求
console.log('\n\n示例请求（可用于 API 测试）：');
console.log('-'.repeat(60));
const exampleRequest = {
  materialType: 'certificate',
  title: '高中数学教师资格证',
  originalFilename: 'math_teacher_cert.jpg',
  mimeType: 'image/jpeg',
  extractedText: '教师资格证 高中数学 合格 认定 证书编号：2024001234',
  teacherProfile: {
    subjects: ['数学'],
    fullName: '张老师',
    teachingExperience: 5
  }
};
console.log(JSON.stringify(exampleRequest, null, 2));