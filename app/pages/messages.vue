<script setup lang="ts">
useSeoMeta({
  title: '留言板',
  description: '在这里留下你的想法和建议',
})

const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'blog-tech', 'comm-group'])
</script>

<template>
  <div class="messages-page">
    <div class="page-header">
      <h1 class="text-creative">
        <Icon name="ph:chat-circle-dots-bold" />
        留言板
      </h1>
      <p class="page-desc">在这里留下你的想法和建议</p>
    </div>

    <div class="messages-content">
      <div class="welcome-card">
        <div class="welcome-icon">
          <Icon name="ph:hand-waving" />
        </div>
        <div class="welcome-text">
          <h3>欢迎来到本站留言板！</h3>
          <p>这里是大家交流想法、分享心得的地方。你可以：</p>
          <ul>
            <li><Icon name="ph:chat-bold" /> 留下对网站的建议和反馈</li>
            <li><Icon name="ph:lightbulb-bold" /> 分享有趣的想法和见解</li>
            <li><Icon name="ph:users-bold" /> 与其他访客进行友好交流</li>
            <li><Icon name="ph:question-bold" /> 提出你的疑问和问题</li>
          </ul>
          <p class="notice">
            <Icon name="ph:info-bold" />
            请文明留言，共同维护良好的交流环境
          </p>
        </div>
      </div>

        <PostComment />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.messages-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
  
  @media (max-width: 768px) {
    padding: 1rem 0.5rem;
  }
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
  
  h1 {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--c-text-1);
    margin-bottom: 0.5rem;
    
    svg {
      color: var(--c-brand);
    }
    
    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }
  
  .page-desc {
    color: var(--c-text-2);
    font-size: 1.1rem;
    margin: 0;
  }
}

.messages-content {
  display: flex;
  flex-direction: column;
}
.z-comment{
  margin: 0 1rem !important;
}

.welcome-card {
  background: var(--ld-bg-card);
  border: 1px solid var(--c-border);
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  gap: 1.5rem;
  align-items: center;
  transition: all 0.3s ease;
  margin: 1rem;
  
  &:hover {
    border-color: var(--c-brand);
    box-shadow: 0 8px 25px rgba(var(--c-brand-rgb), 0.1);
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
    gap: 1rem;
  }
}

.welcome-icon {
  font-size: 3rem;
  color: var(--c-brand);
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
}

.welcome-text {
  flex: 1;
  
  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--c-text-1);
    margin: 0 0 1rem 0;
    
    @media (max-width: 768px) {
      font-size: 1.3rem;
    }
  }
  
  p {
    color: var(--c-text-2);
    line-height: 1.6;
    margin: 0 0 1rem 0;
    
    &.notice {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: var(--c-bg-mute);
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
      margin: 1.5rem auto 0;
      
      svg {
        color: var(--c-brand);
        font-size: 1.1rem;
        flex-shrink: 0;
      }
      
      @media (max-width: 768px) {
        flex-direction: column;
        text-align: center;
        gap: 0.25rem;
      }
    }
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 1rem 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 0.5rem;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
  
  li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--c-text-2);
    font-size: 0.95rem;
    
    svg {
      color: var(--c-brand);
      font-size: 1.1rem;
      flex-shrink: 0;
    }
  }
}

// 动画效果
.messages-page {
  animation: fade-in 0.6s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.welcome-card {
  animation: slide-up 0.6s ease-out backwards;
}

.welcome-card { animation-delay: 0.1s; }

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>