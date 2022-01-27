# 分页插件
>在启动类中 添加即可

```java
/**  
 * myBastPlus分页插件  
 */  
@Bean  
public MybatisPlusInterceptor mybatisPlusInterceptor() {  
    MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();  
 interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));  
 return interceptor;  
}
```