import { describe, it, expect } from 'vitest';

/**
 * @description 示例测试文件
 * @author YYC
 * @created 2024-01-20
 */
describe('示例测试套件', () => {
  it('应该能够正确执行基本测试', () => {
    const sum = 1 + 2;
    expect(sum).toBe(3);
  });

  it('应该能够测试字符串操作', () => {
    const str = 'hello world';
    expect(str.toUpperCase()).toBe('HELLO WORLD');
    expect(str.length).toBe(11);
  });

  it('应该能够测试对象比较', () => {
    const obj = { name: 'test', value: 123 };
    expect(obj).toEqual({ name: 'test', value: 123 });
    expect(obj.name).toBe('test');
  });
});